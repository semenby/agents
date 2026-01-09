'use strict';

var aws = require('@langchain/aws');
var messages = require('@langchain/core/messages');
var outputs = require('@langchain/core/outputs');

/**
 * Optimized ChatBedrockConverse wrapper that fixes contentBlockIndex conflicts
 *
 * Bedrock sends the same contentBlockIndex for both text and tool_use content blocks,
 * causing LangChain's merge logic to fail with "field[contentBlockIndex] already exists"
 * errors. This wrapper simply strips contentBlockIndex from response_metadata to avoid
 * the conflict.
 *
 * The contentBlockIndex field is only used internally by Bedrock's streaming protocol
 * and isn't needed by application logic - the index field on tool_call_chunks serves
 * the purpose of tracking tool call ordering.
 */
class CustomChatBedrockConverse extends aws.ChatBedrockConverse {
    constructor(fields) {
        super(fields);
    }
    static lc_name() {
        return 'LibreChatBedrockConverse';
    }
    /**
     * Override _streamResponseChunks to strip contentBlockIndex from response_metadata
     * This prevents LangChain's merge conflicts when the same index is used for
     * different content types (text vs tool calls)
     */
    async *_streamResponseChunks(messages$1, options, runManager) {
        const baseStream = super._streamResponseChunks(messages$1, options, runManager);
        for await (const chunk of baseStream) {
            // Only process if we have response_metadata
            if (chunk.message instanceof messages.AIMessageChunk &&
                chunk.message.response_metadata &&
                typeof chunk.message.response_metadata === 'object') {
                // Check if contentBlockIndex exists anywhere in response_metadata (top level or nested)
                const hasContentBlockIndex = this.hasContentBlockIndex(chunk.message.response_metadata);
                if (hasContentBlockIndex) {
                    const cleanedMetadata = this.removeContentBlockIndex(chunk.message.response_metadata);
                    yield new outputs.ChatGenerationChunk({
                        text: chunk.text,
                        message: new messages.AIMessageChunk({
                            ...chunk.message,
                            response_metadata: cleanedMetadata,
                        }),
                        generationInfo: chunk.generationInfo,
                    });
                    continue;
                }
            }
            yield chunk;
        }
    }
    /**
     * Check if contentBlockIndex exists at any level in the object
     */
    hasContentBlockIndex(obj) {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return false;
        }
        if ('contentBlockIndex' in obj) {
            return true;
        }
        for (const value of Object.values(obj)) {
            if (typeof value === 'object' && value !== null) {
                if (this.hasContentBlockIndex(value)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Recursively remove contentBlockIndex from all levels of an object
     */
    removeContentBlockIndex(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.removeContentBlockIndex(item));
        }
        if (typeof obj === 'object') {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                if (key !== 'contentBlockIndex') {
                    cleaned[key] = this.removeContentBlockIndex(value);
                }
            }
            return cleaned;
        }
        return obj;
    }
}

exports.CustomChatBedrockConverse = CustomChatBedrockConverse;
//# sourceMappingURL=index.cjs.map
