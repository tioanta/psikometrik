document.addEventListener('DOMContentLoaded', () => {

    /* --- DOM Elements --- */
    const viewDemographics = document.getElementById('viewDemographics');
    const viewTest = document.getElementById('viewTest');
    const viewResult = document.getElementById('viewResult');
    
    const demographicForm = document.getElementById('demographicForm');
    const steps = document.querySelectorAll('.step');
    const stepLines = document.querySelectorAll('.step-line');
    
    const questionContainer = document.getElementById('questionContainer');
    const questionCounter = document.getElementById('questionCounter');
    const testProgressFill = document.getElementById('testProgressFill');
    const btnNextTest = document.getElementById('btnNextTest');
    const btnPrevTest = document.getElementById('btnPrevTest');
    
    /* --- State --- */
    let userData = {};
    let currentQuestionIndex = 0;
    
    // Answers will map question index -> selected option ('A' or 'B')
    let userAnswers = {}; 
    let questions = [];

    /* --- Navigation Functions --- */
    function showView(viewId, stepIndex) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        // Update progress UI
        steps.forEach((step, idx) => {
            if (idx < stepIndex) {
                step.classList.add('completed', 'active');
            } else if (idx === stepIndex - 1) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        stepLines.forEach((line, idx) => {
            if (idx < stepIndex - 1) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }

    /* --- Form Submission (Step 1 -> 2) --- */
    demographicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        userData = {
            fullName: document.getElementById('fullName').value,
            domicile: document.getElementById('domicile').value,
            age: document.getElementById('age').value,
            education: document.getElementById('education').value,
            occupation: document.getElementById('occupation').value,
            income: document.getElementById('income').value
        };

        // Fetch questions from JSON file
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error('Gagal memuat pertanyaan referensi.');
            }
            questions = await response.json();
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat memuat soal. Pastikan file questions.json tersedia.");
            return; // Stop flow error
        }

        showView('viewTest', 2);
        renderQuestion();
    });

    /* --- Test Flow (Step 2) --- */
    function renderQuestion() {
        const q = questions[currentQuestionIndex];
        
        questionCounter.textContent = `Soal ${currentQuestionIndex + 1} dari ${questions.length}`;
        const progressPercentage = ((currentQuestionIndex) / (questions.length - 1)) * 100;
        testProgressFill.style.width = `${progressPercentage}%`;

        // Check if an option was previously selected
        const selectedOpt = userAnswers[currentQuestionIndex];

        questionContainer.innerHTML = `
            <div class="question-content">
                <h3>${q.text}</h3>
                <div class="options-container">
                    <button type="button" class="option-btn ${selectedOpt === 'A' ? 'selected' : ''}" data-choice="A">
                        <div class="option-indicator"><i class="fa-solid fa-check"></i></div>
                        ${q.optionA.text}
                    </button>
                    <button type="button" class="option-btn ${selectedOpt === 'B' ? 'selected' : ''}" data-choice="B">
                        <div class="option-indicator"><i class="fa-solid fa-check"></i></div>
                        ${q.optionB.text}
                    </button>
                </div>
            </div>
        `;

        // Option event listeners
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove selected class from all
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                // Add to clicked
                this.classList.add('selected');
                
                // Save answer
                userAnswers[currentQuestionIndex] = this.getAttribute('data-choice');
                
                // Enable next button
                btnNextTest.disabled = false;
            });
        });

        // Navigation state
        btnPrevTest.disabled = currentQuestionIndex === 0;
        btnNextTest.disabled = !userAnswers[currentQuestionIndex];

        if (currentQuestionIndex === questions.length - 1) {
            btnNextTest.innerHTML = 'Selesaikan & Lihat Hasil <i class="fa-solid fa-flag-checkered"></i>';
        } else {
            btnNextTest.innerHTML = 'Selanjutnya <i class="fa-solid fa-arrow-right"></i>';
        }
    }

    btnNextTest.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            // Finish test
            calculateScore();
        }
    });

    btnPrevTest.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    /* --- Scoring logic (Step 2 -> 3) --- */
    function calculateScore() {
        let totalScore = 0;
        let varScores = {
            "Hardworking": 0,
            "Procrastination": 0,
            "Conscientiousness": 0,
            "Locus of Control": 0,
            "Responsibility": 0,
            "Neuroticism": 0
        };

        questions.forEach((q, index) => {
            const answer = userAnswers[index];
            let isKey = false;
            if (answer === 'A') isKey = q.optionA.isKey;
            if (answer === 'B') isKey = q.optionB.isKey;

            const score = isKey ? 2 : 1;
            totalScore += score;
            varScores[q.var] += score;
        });

        showResult(totalScore, varScores);
        showView('viewResult', 3);
    }

    function showResult(totalScore, varScores) {
        // Demographics mapping
        const profileList = document.getElementById('profileList');
        profileList.innerHTML = `
            <li><span class="profile-label">Nama</span> <span class="profile-value">${userData.fullName}</span></li>
            <li><span class="profile-label">Domisili</span> <span class="profile-value">${userData.domicile}</span></li>
            <li><span class="profile-label">Usia</span> <span class="profile-value">${userData.age} Tahun</span></li>
            <li><span class="profile-label">Pendidikan</span> <span class="profile-value">${userData.education}</span></li>
            <li><span class="profile-label">Usaha</span> <span class="profile-value">${userData.occupation}</span></li>
            <li><span class="profile-label">Penghasilan</span> <span class="profile-value">${userData.income}</span></li>
        `;

        // Update Score and Status logic (>= 30 LAYAK)
        const scoreVal = document.getElementById('totalScoreValue');
        const badge = document.getElementById('eligibilityStatus');
        const statusCard = document.getElementById('statusCard');
        const statusDesc = document.getElementById('statusDesc');

        scoreVal.textContent = totalScore;

        if (totalScore >= 30) {
            badge.textContent = "LAYAK";
            badge.className = "status-badge layak";
            statusDesc.textContent = "Skor memenuhi kelayakan kredit (>= 30).";
            statusCard.style.borderTop = "4px solid var(--success)";
        } else {
            badge.textContent = "TIDAK LAYAK";
            badge.className = "status-badge tidak-layak";
            statusDesc.textContent = "Skor tidak memenuhi ambang batas minimal (< 30).";
            statusCard.style.borderTop = "4px solid var(--error)";
        }

        renderCharts(totalScore, varScores);
    }

    /* --- Chart.js Integrations --- */
    function renderCharts(totalScore, varScores) {
        // Clear old canvases
        document.querySelector('.gauge-container').innerHTML = '<canvas id="gaugeChart"></canvas>';
        document.querySelector('.radar-wrapper').innerHTML = '<canvas id="radarChart"></canvas>';
        
        const ctxRadar = document.getElementById('radarChart').getContext('2d');
        const ctxGauge = document.getElementById('gaugeChart').getContext('2d');

        // Label preparation
        const labels = Object.keys(varScores);
        const dataVals = Object.values(varScores);

        // Radar Chart
        new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Skor Dimensi',
                    data: dataVals,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4F46E5',
                    pointBackgroundColor: '#4F46E5',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4F46E5',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0,0,0,0.1)' },
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        pointLabels: {
                            font: { family: 'Inter', size: 11, weight: 600 },
                            color: '#4B5563'
                        },
                        ticks: { min: 3, max: 6, stepSize: 1, display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Half Doughnut Gauge Chart for Total Score (18 to 36)
        // Normalize range 18-36 to 0-100 logic visually 
        const maxScore = 36;
        const color = totalScore >= 30 ? '#10B981' : '#EF4444'; // Green or Red
        const remainder = maxScore - totalScore;

        new Chart(ctxGauge, {
            type: 'doughnut',
            data: {
                labels: ['Skor', 'Sisa'],
                datasets: [{
                    data: [totalScore, remainder],
                    backgroundColor: [color, '#E5E7EB'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }
});
