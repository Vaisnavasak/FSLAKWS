# FSLAKWS - Few Shot Language Agnostic Key Word Spotting System (FSLAKWS) for audio
This project is an audio keyword search system. It is employed to search and find a specific keyword in an audio. It works for ANY word defined by user in ANY language. The system finds the word and present it with every timestamps it was spoken in the audio.
## Workflow:
1. Provide a target keyword along with a few (for example, 5) audio recordings of that keyword.
2. Upload a longer audio recording in which the keyword should be searched.
3. The system extracts audio features from both the sample recordings and the target audio.
4. It compares learned representations to identify occurrences of the keyword.
5. The detected timestamps of every occurrence are returned to the user.
## Simple understanding
It is like Ctrl + F which is used to find a specific word in a text. But here it search and find for a specific word in an audio.
## Technology stack:
1. **Frontend  :** React.js
2. **Backend   :** Spring Boot (Java)
3. **AI Engine :** Python (Deep Learning)
4. **Database  :** MySQL
