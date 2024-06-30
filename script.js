document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let questions = [];

    // Fetch data from data.json
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        console.log('Questions loaded:', questions); // Debug statement
        loadQuestion();
        document.getElementById('quiz-container').style.display = 'block';

        // Add event listener for "Skip Question" button
       
        const skipComparisonButton = document.querySelector('#comparison-container button[onclick="skipComparison()"]');
        skipComparisonButton.addEventListener('click', skipComparison);

        const submitAndFinishButton = document.querySelector('#comparison-container button[onclick="submitAndFinish()"]');
        submitAndFinishButton.addEventListener('click', submitAndFinish);
    })
    .catch(error => {
        console.error('Error loading data.json:', error); // Debug statement
    });

    function loadQuestion() {
        if (currentQuestionIndex < questions.length) {
            const questionContainer = document.getElementById('question-container');
            const method = questions[currentQuestionIndex].method;
            const comment = questions[currentQuestionIndex]['comment_2'];
            console.log('Loading question:', currentQuestionIndex, method, comment); // Debug statement
            questionContainer.innerHTML = `
                <pre>${method}</pre>
                <p>${comment}</p>
            `;
    
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
        const meaningfulness = document.getElementById('meaningfulness').value;
        const naturalness = document.getElementById('naturalness').value;
        const consistency = document.getElementById('consistency').value;

        if (!validateRating(meaningfulness) || !validateRating(naturalness) || !validateRating(consistency)) {
            alert('Please enter valid ratings between 1 and 5.');
            return;
        }

        const formData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment: questions[currentQuestionIndex]['comment_2'],
            meaningfulness: meaningfulness,
            naturalness: naturalness,
            consistency: consistency
        };

        console.log('Submitting', formData); // Debug statement

        submitToGoogleForms(formData);

        currentQuestionIndex++;
        loadQuestion();
    };

    window.skipToComparison = function() {
        const formData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment: questions[currentQuestionIndex]['comment_2'],
            meaningfulness: null,
            naturalness: null,
            consistency: null
        };
    
        console.log('Skipping to comparison', formData);
    
        submitToGoogleForms(formData);
    
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
    
        const formData = {
            method_id: questions[currentQuestionIndex].method_id,
            method: questions[currentQuestionIndex].method,
            comment: questions[currentQuestionIndex]['comment_2'],
            meaningfulness: null,
            naturalness: null,
            consistency: null
        };
    
        console.log('Skipping question', formData);
    
        submitToGoogleForms(formData);
    
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
            skipQuestionButton.addEventListener('click', skipQuestion);
        } else {
            document.getElementById('quiz-container').style.display = 'none';
            document.getElementById('comparison-container').style.display = 'block';
            loadComparison();
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
