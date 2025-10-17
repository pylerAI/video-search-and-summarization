# VILA System Message Handling Fix

## Problem Description

The VILA deployment was not properly handling system messages from OpenAI chat format requests. Specifically:

1. **System messages were being ignored**: The timestamp instructions like "These are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps." were not being passed to the VILA model.

2. **Default system message was used**: VILA was using the default hermes-2 system message "Answer the questions." instead of the OpenAI format system message.

3. **Timestamps not referenced**: The model was not referencing the specific timestamps provided in system messages.

## Root Cause

The issue was in the `process_multimodal_input()` function in `/vlm_deploy/vila15/VILA/serving/server.py`:

- System message content was being extracted but **added to the prompt text** instead of being used to **set the conversation's system message**
- The VILA conversation template was using its default system message
- No mechanism existed to update the conversation system message from the OpenAI format

## Solution

### 1. Updated `process_multimodal_input()` Function

**Before:**
```python
def process_multimodal_input(messages, frame_processor, emb_generator) -> tuple[str, dict]:
    # System message content was added to prompt_parts
    if message.role == "system":
        prompt_parts.append(content.text)  # ❌ Wrong approach
```

**After:**
```python
def process_multimodal_input(messages, frame_processor, emb_generator) -> tuple[str, dict, str]:
    # System message content is extracted separately
    if message.role == "system":
        system_message = content.text  # ✅ Extracted separately
        # NOT added to prompt_parts
```

### 2. Updated `generate_response()` Function

**Before:**
```python
def generate_response(prompt_text, media_content, request, model) -> str:
    ctx = Vila15Context(model)
    # No system message handling
```

**After:**
```python
def generate_response(prompt_text, media_content, request, model, system_message=None) -> str:
    ctx = Vila15Context(model)
    if system_message:
        ctx.set_system_message(system_message)  # ✅ Set system message
```

### 3. Added `Vila15Context.set_system_message()` Method

**New method in `/vlm_deploy/vila15/vila15_context.py`:**
```python
def set_system_message(self, system_message: str):
    """Set the system message for the conversation."""
    if system_message:
        # Format properly for hermes-2 template
        if "hermes" in self._conv.version:
            self._conv.system = f"<|im_start|>system\n{system_message}"
        else:
            self._conv.system = system_message
```

### 4. Updated Function Call Chain

**Before:**
```python
prompt_text, media_content = process_multimodal_input(...)
response_content = generate_response(prompt_text, media_content, request, model)
```

**After:**
```python
prompt_text, media_content, system_message = process_multimodal_input(...)
response_content = generate_response(prompt_text, media_content, request, model, system_message)
```

## Result

### Before Fix:
```
Conversation System Message: "Answer the questions."
Generated Prompt: "<|im_start|>system\nAnswer the questions.<|im_end|>..."
```

### After Fix:
```
Conversation System Message: "These are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps."
Generated Prompt: "<|im_start|>system\nThese are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps.<|im_end|>..."
```

## Testing

### Tests Created:
1. **`test_image_timestamps.py`**: Full integration test with OpenAI format requests
2. **`test_simple_conversation.py`**: Unit test for conversation system message handling
3. **`test_conversation_system_message.py`**: Test VILA context system message setting

### Test Results:
- ✅ System message extraction working correctly
- ✅ Timestamps parsed from system messages: `[10.5, 15.2, 20.8]`
- ✅ Conversation formatting includes timestamp instructions
- ✅ User message processed separately from system message

## Impact

After this fix:
1. **Timestamp instructions are properly received by VILA**
2. **System messages from OpenAI format are used instead of being ignored**
3. **Model should now reference timestamps in responses** (e.g., "At timestamp 10.5 seconds...")
4. **CompOpenAIModel integration should work correctly**

## Files Modified

1. **`/vlm_deploy/vila15/VILA/serving/server.py`**:
   - Updated `process_multimodal_input()` function
   - Updated `generate_response()` function
   - Updated function call in chat endpoint

2. **`/vlm_deploy/vila15/vila15_context.py`**:
   - Added `set_system_message()` method

## Validation

To validate the fix works:
1. Run `python test_image_timestamps.py` (tests system message extraction)
2. Run `python test_simple_conversation.py` (tests conversation formatting)
3. Start VILA server and send OpenAI format requests with system messages
4. Verify model responses reference the timestamps provided in system messages

The fix ensures VILA properly processes system messages with timestamp instructions from the video search and summarization system.