# DATABASE REQUIREMENT ANALYSIS

## TABLE 1: Users


**Columns:**

* user_id 
* name
* email
* password

---

## TABLE 2: Keyword_Sample


**Columns:**

* keyword_id 
* user_id 
* keyword_name
* audio_file_path

---

## TABLE 3: Target_Audio


**Columns:**

* audio_id 
* user_id 
* target_name

---

## TABLE 4: Search_Result


**Columns:**

* result_id 
* user_id
* keyword_id 
* audio_id 
* timestamp 

  * start_time
  * end_time
* created_date

---

## TABLE 5: Search_History


**Columns:**

* history_id 
* user_id 
* keyword_name
* result_id 
