import re
from typing import List, Optional, Union

def extract_string_of_times(prompt: str) -> str:
    """
    Extract the string of times from a prompt formatted by the OpenAI compatible model.
    
    Args:
        prompt: The full prompt containing timestamps
        
    Returns:
        The extracted string of times (e.g., "<1.5> <3.0> <4.5> ")
    """
    # Pattern to match the timestamps section
    # Looks for: "These are images sampled from a video [format] : [timestamps].[rest of prompt]"
    pattern = r"These are images sampled from a video.*?:\s*((?:<[^>]+>\s*)+)\."
    
    match = re.search(pattern, prompt)
    if match:
        return match.group(1).strip()
    
    return ""

def extract_individual_timestamps(string_of_times: str) -> list:
    """
    Extract individual timestamps from the string of times.
    
    Args:
        string_of_times: String like "<1.5> <3.0> <4.5> "
        
    Returns:
        List of timestamp strings without brackets: ["1.5", "3.0", "4.5"]
    """
    # Pattern to find content between < and >
    pattern = r"<([^>]+)>"
    timestamps = re.findall(pattern, string_of_times)
    return timestamps

def parse_timestamps_with_format(string_of_times: str, prompt: str) -> tuple:
    """
    Extract timestamps and determine their format (seconds vs RFC3339).
    
    Args:
        string_of_times: String like "<1.5> <3.0> <4.5> "
        prompt: Full prompt to determine format
        
    Returns:
        Tuple of (timestamps_list, is_rfc3339_format)
    """
    timestamps = extract_individual_timestamps(string_of_times)
    
    # Check if prompt mentions RFC3339 format (RTSP streams)
    is_rfc3339 = "timestamps in RFC3339 format" in prompt
    
    return timestamps, is_rfc3339

def extract_video_frames_times(text: str) -> Optional[List[float]]:
    """
    Extract timestamps from text like '<90.01> <91.93> <93.8>'
    Returns list of float timestamps or None if no timestamps found
    """
    try:
        if not text:
            return None
            
        # Regex to match numbers inside angle brackets
        # This pattern matches: <number> or <number.decimal>
        pattern = r'<(\d+(?:\.\d+)?)>'
        matches = re.findall(pattern, text)
        
        print(f"DEBUG: Input text: '{text}'")
        print(f"DEBUG: Regex matches: {matches}")
        
        if matches:
            # Convert string numbers to floats
            timestamps = [float(match) for match in matches]
            print(f"DEBUG: Converted timestamps: {timestamps}")
            return timestamps
        else:
            print("DEBUG: No matches found")
            return None
            
    except Exception as e:
        print(f"Error extracting timestamps: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None

# Alternative function if the above doesn't work
def extract_video_frames_times_v2(text: str) -> Optional[List[str]]:
    """
    Alternative implementation - return strings first, convert later
    """
    try:
        if not text:
            return None
            
        # Find all text between < and >
        pattern = r'<([^>]+)>'
        matches = re.findall(pattern, text)
        
        print(f"DEBUG v2: Input text: '{text}'")
        print(f"DEBUG v2: Raw matches: {matches}")
        
        if matches:
            # Filter to only numeric values
            timestamps = []
            for match in matches:
                try:
                    # Try to convert to float to validate it's a number
                    float(match)
                    timestamps.append(match)
                except ValueError:
                    print(f"DEBUG v2: Skipping non-numeric: '{match}'")
                    continue
            
            print(f"DEBUG v2: Final timestamps: {timestamps}")
            return timestamps if timestamps else None
        else:
            print("DEBUG v2: No matches found")
            return None
            
    except Exception as e:
        print(f"Error in v2 extracting timestamps: {e}")
        return None

# Test examples:
if __name__ == "__main__":
    # Example 1: Regular video with seconds
    prompt1 = "These are images sampled from a video at timestamps in seconds : <1.5> <3.0> <4.5> .What is happening in this video?Make sure the answer contain correct timestamps."
    
    # Example 2: RTSP stream with RFC3339
    prompt2 = "These are images sampled from a video at timestamps in RFC3339 format : <2024-01-15T10:30:00Z> <2024-01-15T10:30:05Z> .Describe the scene.Make sure the answer contain correct timestamps."
    
    print("=== Example 1 ===")
    extract_video_frames_times(prompt1)
    
    print("\n=== Example 2 ===")
    extract_video_frames_times(prompt2)