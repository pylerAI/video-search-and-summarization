#!/usr/bin/env python3
"""Unit test for VILA conversation system message handling."""

import sys
import os

# Add VILA path to sys.path
sys.path.append('/home/runner/work/video-search-and-summarization/video-search-and-summarization/vlm_deploy/vila15/VILA')
sys.path.append('/home/runner/work/video-search-and-summarization/video-search-and-summarization/vlm_deploy/vila15')

def test_conversation_system_message():
    """Test that conversation system message can be set correctly."""
    try:
        # Import the conversation module
        from llava.conversation import conv_templates
        
        # Get a copy of the hermes-2 template that VILA uses
        conv = conv_templates["hermes-2"].copy()
        
        print("=== Testing Conversation System Message ===")
        print(f"Default system message: '{conv.system}'")
        
        # Test updating the system message
        new_system_message = "These are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps."
        
        # For hermes-2 format, we format it properly
        formatted_system = f"<|im_start|>system\n{new_system_message}"
        conv.system = formatted_system
        
        print(f"Updated system message: '{conv.system}'")
        
        # Add a test user message
        conv.append_message(conv.roles[0], "What do you see in this image?")
        conv.append_message(conv.roles[1], None)
        
        # Generate the full prompt
        full_prompt = conv.get_prompt()
        print(f"\nGenerated prompt:")
        print("=" * 50)
        print(full_prompt)
        print("=" * 50)
        
        # Check if the system message is included in the prompt
        if new_system_message in full_prompt:
            print("✅ SUCCESS: System message is properly included in the conversation prompt")
            return True
        else:
            print("❌ ISSUE: System message not found in the conversation prompt")
            return False
            
    except Exception as e:
        print(f"❌ Error testing conversation: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_vila_context_system_message():
    """Test Vila15Context system message setting (mock test)."""
    try:
        print("\n=== Testing Vila15Context System Message ===")
        
        # Create a mock model class for testing
        class MockModel:
            def __init__(self):
                from llava.conversation import conv_templates
                self.model_name = "vila-test"
                
            def get_conv(self):
                from llava.conversation import conv_templates
                return conv_templates["hermes-2"].copy()
        
        # Import Vila15Context
        from vila15_context import Vila15Context
        
        # Create context with mock model
        mock_model = MockModel()
        ctx = Vila15Context(mock_model)
        
        print(f"Initial system message: '{ctx._conv.system}'")
        
        # Test setting system message
        test_system_message = "These are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps."
        ctx.set_system_message(test_system_message)
        
        print(f"Updated system message: '{ctx._conv.system}'")
        
        # Check if it was set correctly
        if test_system_message in ctx._conv.system:
            print("✅ SUCCESS: Vila15Context system message setting works correctly")
            return True
        else:
            print("❌ ISSUE: Vila15Context system message not set properly")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Vila15Context: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing VILA conversation system message handling...")
    
    # Test basic conversation system message
    conv_success = test_conversation_system_message()
    
    # Test Vila15Context system message setting
    ctx_success = test_vila_context_system_message()
    
    if conv_success and ctx_success:
        print("\n✅ All conversation system message tests passed!")
        print("🎉 The fix should work correctly when the full server runs!")
    else:
        print("\n❌ Some tests failed. The system message handling may have issues.")
        exit(1)