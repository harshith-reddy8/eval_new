document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let questions = [];

    // Show the quiz container immediately
    document.getElementById('quiz-container').style.display = 'block';

    // Fetch data from data.json
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        console.log('Questions loaded:', questions); // Debug statement
        loadQuestion();

        const skipComparisonButton = document.querySelector('#comparison-container button[onclick="skipComparison()"]');
        skipComparisonButton.addEventListener('click', skipComparison);

        const submitAndFinishButton = document.querySelector('#comparison-container button[onclick="submitAndFinish()"]');
        submitAndFinishButton.addEventListener('click', submitAndFinish);
    })
    .catch(error => {
        console.error('Error loading data.json:', error); // Debug statement
        // Display an error message to the user
        document.getElementById('question-container').innerHTML = '<p>Error loading questions. Please try refreshing the page.</p>';
    });

    function loadQuestion() {
        if (currentQuestionIndex < questions.length) {
            const questionContainer = document.getElementById('question-container');
            const commentContainer = document.getElementById('comment-container');
            const method = questions[currentQuestionIndex].method;
            const comment1 = questions[currentQuestionIndex]['comment_1'];
            const comment2 = questions[currentQuestionIndex]['comment_2'];
            console.log('Loading question:', currentQuestionIndex, method, comment1, comment2); // Debug statement
            
            questionContainer.innerHTML = `<pre>${method}</pre>`;
            commentContainer.innerHTML = `<p id="current-comment">${comment1}</p>`;
    
            // Store both comments in data attributes
            commentContainer.dataset.comment1 = comment1;
            commentContainer.dataset.comment2 = comment2;
            commentContainer.dataset.currentComment = 'comment1';
    
            // Clear the input fields
            document.getElementById('meaningfulness').value = '';
            document.getElementById('naturalness').value = '';
            document.getElementById('consistency').value = '';
    
            const skipQuestionButton = document.getElementById('skip-question');
            skipQuestionButton.removeEventListener('click', skipQuestion);
            skipQuestionButton.addEventListener('click', skipQuestion);
        } else {
            document.getElementById('quiz-container').style.display = 'none';
            document.getElementById('comparison-container').style.display = 'block';
            loadComparison();
        }
    }

    function validateRating(value) {
        const intValue = parseInt(value, 10);
        return intValue >= 1 && intValue <= 5;
    }

    window.submitRating = function() {
        const meaningfulness = document.querySelector('input[name="meaningfulness"]:checked')?.value;
        const naturalness = document.querySelector('input[name="naturalness"]:checked')?.value;
        const consistency = document.querySelector('input[name="consistency"]:checked')?.value;
    
        if (!meaningfulness || !naturalness || !consistency) {
            alert('Please select a rating for all criteria.');
            return;
        }
    
        const questionContainer = document.getElementById('comment-container');
        const currentComment = questionContainer.dataset.currentComment;
    
        const formData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment: questionContainer.dataset[currentComment],
            meaningfulness: meaningfulness,
            naturalness: naturalness,
            consistency: consistency
        };
    
        console.log('Submitting', formData); // Debug statement
    
        submitToGoogleForms(formData);
    
        if (currentComment === 'comment1') {
            // Switch to comment2
            questionContainer.dataset.currentComment = 'comment2';
            document.getElementById('current-comment').textContent = questionContainer.dataset.comment2;
            
            // Clear the radio button selections
            document.querySelectorAll('#rating-form input[type="radio"]').forEach(radio => radio.checked = false);
        } else {
            // Move to the next question
            currentQuestionIndex++;
            loadQuestion();
        }
    };

    window.skipToComparison = function() {
        const questionContainer = document.getElementById('question-container');
        const currentComment = questionContainer.dataset.currentComment;

        const formData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment: questionContainer.dataset[currentComment],
            meaningfulness: null,
            naturalness: null,
            consistency: null
        };

        console.log('Skipping to comparison', formData);

        submitToGoogleForms(formData);

        // If we're on the first comment, submit a skipped entry for the second comment as well
        if (currentComment === 'comment1') {
            const secondFormData = {
                ...formData,
                comment: questionContainer.dataset.comment2
            };
            console.log('Skipping second comment', secondFormData);
            submitToGoogleForms(secondFormData);
        }

        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('comparison-container').style.display = 'block';

        loadComparison();
    };

    function loadComparison() {
        if (currentQuestionIndex < questions.length) {
            const method = questions[currentQuestionIndex].method;
            const comment1 = questions[currentQuestionIndex]['comment_1'];
            const comment2 = questions[currentQuestionIndex]['comment_2'];
            console.log('Loading comparison:', currentQuestionIndex, method, comment1, comment2); // Debug statement

            document.getElementById('method-display').innerHTML = `<pre>${method}</pre>`;
            document.getElementById('comment1').textContent = comment1;
            document.getElementById('comment2').textContent = comment2;
        } else {
            document.getElementById('comparison-container').innerHTML = '<p>Thank you for completing the survey!</p>';
        }
    }

    window.submitComparison = function() {
        const preferredComment = document.querySelector('input[name="preferred-comment"]:checked').value;
        const reason = document.getElementById('reason').value;
    
        const comparisonData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment1: questions[currentQuestionIndex]['comment_1'],
            comment2: questions[currentQuestionIndex]['comment_2'],
            preferredComment: preferredComment,
            reason: reason
        };
    
        console.log('Submitting comparison', comparisonData);
    
        submitComparisonToGoogleForms(comparisonData);
    
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadComparison();
        } else {
            document.getElementById('quiz-container').style.display = 'none';
            document.getElementById('comparison-container').innerHTML = '<p>Thank you for completing the survey!</p>';
        }
    };

    function submitToGoogleForms(data) {
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdliVnSZKsyLX1MP8VRoL5ubgxo17oLXGp1qbAl5g4LtjdSqA/formResponse';

        const formData = new FormData();
        formData.append('entry.1377370501', data.method_id); // Method ID
        formData.append('entry.673208300', data.method); // Method
        formData.append('entry.312816773', data.comment); // Comment
        formData.append('entry.439694878', data.meaningfulness); // Meaningfulness
        formData.append('entry.632744986', data.naturalness); // Naturalness
        formData.append('entry.970049141', data.consistency); // Consistency

        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        }).then(response => {
            console.log('Form submitted successfully');
        }).catch(error => {
            console.error('Error submitting form:', error);
        });
    }

    function submitComparisonToGoogleForms(data) {
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfRh7Cv1hvXemEr9-wLz12qkhc0dMWRJ0gMUIejcWT_p5tZUQ/formResponse';

        const formData = new FormData();
        formData.append('entry.698561990', data.method_id); // Method ID
        formData.append('entry.1913479941', data.method); // Method
        formData.append('entry.1432506270', data.comment1); // Comment 1
        formData.append('entry.220256943', data.comment2); // Comment 2
        formData.append('entry.944655743', data.preferredComment); // Preferred Comment (Option 1 or Option 2)
        formData.append('entry.1260493539', data.reason); // Reason

        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        }).then(response => {
            console.log('Comparison form submitted successfully');
        }).catch(error => {
            console.error('Error submitting comparison form:', error);
        });
    }

    window.skipQuestion = function() {
        const skipQuestionButton = document.getElementById('skip-question');
        skipQuestionButton.removeEventListener('click', skipQuestion);

        const questionContainer = document.getElementById('question-container');
        const currentComment = questionContainer.dataset.currentComment;

        const formData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment: questionContainer.dataset[currentComment],
            meaningfulness: null,
            naturalness: null,
            consistency: null
        };

        console.log('Skipping question', formData);

        submitToGoogleForms(formData);

        if (currentComment === 'comment1') {
            // Switch to comment2
            questionContainer.dataset.currentComment = 'comment2';
            document.getElementById('current-comment').textContent = questionContainer.dataset.comment2;
        } else {
            // Move to the next question
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
                skipQuestionButton.addEventListener('click', skipQuestion);
            } else {
                document.getElementById('quiz-container').style.display = 'none';
                document.getElementById('comparison-container').style.display = 'block';
                loadComparison();
            }
        }
    };
    
    window.skipComparison = function() {
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('comparison-container').innerHTML = '<p>Thank you for completing the survey!</p>';
    };
    
    window.submitAndFinish = function() {
        const preferredComment = document.querySelector('input[name="preferred-comment"]:checked').value;
        const reason = document.getElementById('reason').value;
    
        const comparisonData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment1: questions[currentQuestionIndex]['comment_1'],
            comment2: questions[currentQuestionIndex]['comment_2'],
            preferredComment: preferredComment,
            reason: reason
        };
    
        console.log('Submitting comparison', comparisonData);
    
        submitComparisonToGoogleForms(comparisonData);
    
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('comparison-container').innerHTML = '<p>Thank you for completing the survey!</p>';
    };
});
