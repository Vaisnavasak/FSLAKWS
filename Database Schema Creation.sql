-- DATABASE CREATION

CREATE DATABASE fslakws;
USE fslakws;

-- TABLE 1: Users
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- TABLE 2: Keyword_Sample
CREATE TABLE Keyword_Sample (
    keyword_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    keyword_name VARCHAR(100) NOT NULL,
    audio_file_path VARCHAR(255) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
);

-- TABLE 3: Target_Audio
CREATE TABLE Target_Audio (
    audio_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
);

-- TABLE 4: Search_Result
CREATE TABLE Search_Result (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    keyword_id INT NOT NULL,
    audio_id INT NOT NULL,

    start_time VARCHAR(20),
    end_time VARCHAR(20),

    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id),

    FOREIGN KEY (keyword_id)
        REFERENCES Keyword_Sample(keyword_id),

    FOREIGN KEY (audio_id)
        REFERENCES Target_Audio(audio_id)
);

-- TABLE 5: Search_History
CREATE TABLE Search_History (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    result_id INT NOT NULL,
    keyword_id INT NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id),

    FOREIGN KEY (result_id)
        REFERENCES Search_Result(result_id),

    FOREIGN KEY (keyword_id)
        REFERENCES Keyword_Sample(keyword_id)
);
