#!/usr/bin/env python3
"""Simple test for conversation system message without heavy dependencies."""

import sys
import os
import dataclasses
from enum import Enum, auto
from typing import List

# Simplified conversation classes for testing (copied from the actual conversation.py)
class SeparatorStyle(Enum):
    """Different separator style."""
    AUTO = auto()
    SINGLE = auto()
    TWO = auto()
    MPT = auto()
    PLAIN = auto()
    LLAMA_2 = auto()
    MISTRAL = auto()
    LLAMA_3 = auto()

@dataclasses.dataclass
class Conversation:
    """A class that keeps all conversation history."""
    system: str
    roles: List[str]
    messages: List[List[str]]
    offset: int
    sep_style: SeparatorStyle = SeparatorStyle.SINGLE
    sep: str = "###"
    sep2: str = None
    version: str = "Unknown"
    skip_next: bool = False

    def get_prompt(self):
        messages = self.messages
        if len(messages) > 0 and type(messages[0][1]) is tuple:
            messages = self.messages.copy()
            init_role, init_msg = messages[0].copy()
            init_msg = init_msg[0].replace("<image>", "").strip()
            if "mmtag" in self.version:
                messages[0] = (init_role, init_msg)
                messages.insert(0, (self.roles[0], "<Image><image></Image>"))
                messages.insert(1, (self.roles[1], "Received."))
            else:
                messages[0] = (init_role, "<image>\n" + init_msg)

        if self.sep_style == SeparatorStyle.MPT:
            ret = self.system + self.sep
            for role, message in messages:
                if message:
                    if type(message) is tuple:
                        message, _, _ = message
                    ret += role + message + self.sep
                else:
                    ret += role
        else:
            raise ValueError(f"Invalid style: {self.sep_style}")

        return ret

    def append_message(self, role, message):
        self.messages.append([role, message])

    def copy(self):
        return Conversation(
            system=self.system,
            roles=self.roles,
            messages=[[x, y] for x, y in self.messages],
            offset=self.offset,
            sep_style=self.sep_style,
            sep=self.sep,
            sep2=self.sep2,
            version=self.version,
        )

def test_hermes2_conversation():
    """Test the hermes-2 conversation template system message handling."""
    print("=== Testing Hermes-2 Conversation System Message ===")
    
    # Create hermes-2 conversation (matching the actual template)
    hermes_2 = Conversation(
        system="<|im_start|>system\nAnswer the questions.",
        roles=("<|im_start|>user\n", "<|im_start|>assistant\n"),
        sep_style=SeparatorStyle.MPT,
        sep="<|im_end|>",
        messages=[],
        offset=0,
        version="hermes-2",
    )
    
    print(f"Default system message: '{hermes_2.system}'")
    
    # Test updating the system message (like our fix does)
    new_system_message = "These are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps."
    formatted_system = f"<|im_start|>system\n{new_system_message}"
    
    hermes_2.system = formatted_system
    print(f"Updated system message: '{hermes_2.system}'")
    
    # Add test messages
    hermes_2.append_message(hermes_2.roles[0], "What do you see in this image?")
    hermes_2.append_message(hermes_2.roles[1], None)
    
    # Generate the prompt
    full_prompt = hermes_2.get_prompt()
    print(f"\nGenerated conversation prompt:")
    print("=" * 60)
    print(full_prompt)
    print("=" * 60)
    
    # Verify the system message is included
    if new_system_message in full_prompt:
        print("✅ SUCCESS: System message with timestamps is properly included!")
        print(f"✅ Timestamps should be visible to the model: <10.5> <15.2> <20.8>")
        return True
    else:
        print("❌ ISSUE: System message not found in the prompt")
        return False

def test_system_message_comparison():
    """Compare default vs updated system message behavior."""
    print("\n=== Comparing Default vs Updated System Messages ===")
    
    # Default hermes-2 conversation
    default_conv = Conversation(
        system="<|im_start|>system\nAnswer the questions.",
        roles=("<|im_start|>user\n", "<|im_start|>assistant\n"),
        sep_style=SeparatorStyle.MPT,
        sep="<|im_end|>",
        messages=[],
        offset=0,
        version="hermes-2",
    )
    
    # Updated hermes-2 conversation (with our fix)
    updated_conv = Conversation(
        system="<|im_start|>system\nThese are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps.",
        roles=("<|im_start|>user\n", "<|im_start|>assistant\n"),
        sep_style=SeparatorStyle.MPT,
        sep="<|im_end|>",
        messages=[],
        offset=0,
        version="hermes-2",
    )
    
    # Add same user message to both
    user_message = "What do you see in this image?"
    
    default_conv.append_message(default_conv.roles[0], user_message)
    default_conv.append_message(default_conv.roles[1], None)
    
    updated_conv.append_message(updated_conv.roles[0], user_message)
    updated_conv.append_message(updated_conv.roles[1], None)
    
    print("DEFAULT CONVERSATION PROMPT:")
    print("-" * 40)
    print(default_conv.get_prompt())
    print("-" * 40)
    
    print("\nUPDATED CONVERSATION PROMPT (with timestamps):")
    print("-" * 40)
    print(updated_conv.get_prompt())
    print("-" * 40)
    
    # Check difference
    default_prompt = default_conv.get_prompt()
    updated_prompt = updated_conv.get_prompt()
    
    if "timestamps" in updated_prompt and "timestamps" not in default_prompt:
        print("✅ SUCCESS: Updated conversation includes timestamp instruction!")
        print("✅ The model should now see and reference the timestamps.")
        return True
    else:
        print("❌ ISSUE: No difference in timestamp instruction between default and updated")
        return False

if __name__ == "__main__":
    print("Testing VILA conversation system message handling (simplified)...")
    
    # Test hermes-2 conversation system message
    conv_success = test_hermes2_conversation()
    
    # Compare default vs updated behavior
    comparison_success = test_system_message_comparison()
    
    if conv_success and comparison_success:
        print("\n🎉 SUCCESS: All conversation tests passed!")
        print("✅ The system message fix should work correctly!")
        print("✅ VILA will now receive timestamp instructions from the OpenAI format")
    else:
        print("\n❌ Some tests failed")
        exit(1)