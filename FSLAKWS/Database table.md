**DATABASE REQUIREMENT ANALYSIS**

TABLE 1: Users
Purpose: Stores registered users
Columns:
- user_id
- name
- email
- password
- created_date

TABLE 2: Keyword
Purpose: Stores keyword audio samples
         (recorded or uploaded)
Columns:
- keyword_id
- user_id
- keyword_name
- audio_file_path
- created_date

TABLE 3: Target Audio
Purpose: Stores target audio file
Columns:
- audio_id
- user_id
- audio_file_path
- created_date

TABLE 4: Search Results
Purpose: Stores AI detection results
Columns:
- result_id
- user_id
- keyword_id
- audio_id
- timestamps
- created_date

TABLE 5: Search History
Purpose: Stores all searches by user
Columns:
- history_id
- user_id
- keyword_name
- result_id
- searched_date
