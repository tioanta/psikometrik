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

    /* --- Questions Data (Placeholder) ---
       Setiap variabel memiliki 3 soal. 
       Total 18 soal, 6 Variabel (Hardworking, Procrastination, Conscientiousness, Locus of Control, Responsibility, Neuroticism)
       Key answer bernilai 2, Other answer bernilai 1.
    */
    const questions = [
        // 1. Hardworking
        { id: 1, text: "Dalam bekerja, saya cenderung...", var: "Hardworking",
          optionA: { text: "Terus berusaha meskipun menemui kebuntuan (Key)", isKey: true },
          optionB: { text: "Mencari alternatif yang lebih santai", isKey: false } },
        { id: 2, text: "Ketika saya diberikan target yang tinggi...", var: "Hardworking",
          optionA: { text: "Saya merasa tertantang dan bekerja ekstra", isKey: false },
          optionB: { text: "Saya membagi target menjadi tugas-tugas kecil yang bisa diselesaikan bertahap (Key)", isKey: true } },
        { id: 3, text: "Jika ada pekerjaan di luar jam kantor...", var: "Hardworking",
          optionA: { text: "Saya bersedia lembur agar cepat selesai (Key)", isKey: true },
          optionB: { text: "Saya memilih menundanya hingga esok", isKey: false } },

        // 2. Procrastination (Inverse logic conceptually, but scoring follows 'Key' = 2 for good micro-credit score)
        { id: 4, text: "Menghadapi tenggat waktu yang ketat...", var: "Procrastination",
          optionA: { text: "Saya langsung menyelesaikannya secepat mungkin (Key)", isKey: true },
          optionB: { text: "Saya lebih suka mengerjakan tugas lain dan menyelesaikannya nanti", isKey: false } },
        { id: 5, text: "Bila saya diberikan tugas yang membosankan...", var: "Procrastination",
          optionA: { text: "Saya cenderung menundanya sedikit", isKey: false },
          optionB: { text: "Saya segera menyelesaikannya agar tidak membebani pikiran (Key)", isKey: true } },
        { id: 6, text: "Saat ada proyek baru...", var: "Procrastination",
          optionA: { text: "Saya akan mulai mencicil dari sekarang (Key)", isKey: true },
          optionB: { text: "Saya menunggu inspirasi datang sebelum mulai", isKey: false } },

        // 3. Conscientiousness
        { id: 7, text: "Dalam merencanakan sesuatu...", var: "Conscientiousness",
          optionA: { text: "Saya sangat teliti pada detail-detail kecil (Key)", isKey: true },
          optionB: { text: "Saya lebih mementingkan gambaran besar secara fleksibel", isKey: false } },
        { id: 8, text: "Setelah menyelesaikan pekerjaan...", var: "Conscientiousness",
          optionA: { text: "Saya merasa cukup jika sudah selesai", isKey: false },
          optionB: { text: "Saya akan memeriksa ulang untuk memastikan tidak ada kesalahan (Key)", isKey: true } },
        { id: 9, text: "Terhadap aturan dan prosedur yang berlaku...", var: "Conscientiousness",
          optionA: { text: "Saya mematuhinya dengan disiplin tinggi (Key)", isKey: true },
          optionB: { text: "Saya kadang menyesuaikannya dengan situasi", isKey: false } },

        // 4. Locus of Control
        { id: 10, text: "Ketika sesuatu yang buruk terjadi pada hidup saya...", var: "Locus of Control",
          optionA: { text: "Saya percaya hal itu ada penyebab dari luar (nasib/orang lain)", isKey: false },
          optionB: { text: "Saya yakin bahwa sebagian besar karena kesalahan atau kendali saya (Key)", isKey: true } },
        { id: 11, text: "Mengenai kesuksesan finansial...", var: "Locus of Control",
          optionA: { text: "Saya percaya kerja keras akan membawakan hasil yang saya atur (Key)", isKey: true },
          optionB: { text: "Saya percaya keberuntungan memegang peran besar (Key)", isKey: false } },
        { id: 12, text: "Jika saya gagal dalam sebuah usaha...", var: "Locus of Control",
          optionA: { text: "Saya mengevaluasi strategi saya dan mencoba lagi (Key)", isKey: true },
          optionB: { text: "Mungkin memang pasar sedang tidak berpihak kepada saya", isKey: false } },

        // 5. Responsibility
        { id: 13, text: "Jika saya melakukan kesalahan saat bertugas...", var: "Responsibility",
          optionA: { text: "Saya berani mengakui kesalahan dan memperbaikinya (Key)", isKey: true },
          optionB: { text: "Saya akan mencari alasan mengapa hal itu terjadi", isKey: false } },
        { id: 14, text: "Jika saya meminjam uang atau barang...", var: "Responsibility",
          optionA: { text: "Saya berusaha mengembalikannya tepat waktu tanpa ditagih (Key)", isKey: true },
          optionB: { text: "Saya mengembalikannya jika yang meminjamkan sudah menagih", isKey: false } },
        { id: 15, text: "Berkenaan dengan janji...", var: "Responsibility",
          optionA: { text: "Saya sering lupa jika banyak beban pikiran", isKey: false },
          optionB: { text: "Saya selalu menepati janji sekecil apapun (Key)", isKey: true } },

        // 6. Neuroticism (Inverse logic: Key should represent low neuroticism/emotional stability)
        { id: 16, text: "Ketika saya di bawah tekanan tinggi...", var: "Neuroticism",
          optionA: { text: "Saya mudah merasa panik dan cemas", isKey: false },
          optionB: { text: "Saya tetap tenang dan fokus mencari solusi (Key)", isKey: true } },
        { id: 17, text: "Bila saya menerima kritik tajam...", var: "Neuroticism",
          optionA: { text: "Saya merenungkannya berhari-hari dan merasa jatuh", isKey: false },
          optionB: { text: "Saya menjadikannya evaluasi praktis dan terus maju (Key)", isKey: true } },
        { id: 18, text: "Menghadapi kegagalan mendadak...", var: "Neuroticism",
          optionA: { text: "Saya bisa bangkit dan tidak membiarkannya merusak mood saya (Key)", isKey: true },
          optionB: { text: "Suasana hati saya sangat terpukul dan butuh waktu lama pulih", isKey: false } }
    ];

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
    demographicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        userData = {
            fullName: document.getElementById('fullName').value,
            domicile: document.getElementById('domicile').value,
            age: document.getElementById('age').value,
            education: document.getElementById('education').value,
            occupation: document.getElementById('occupation').value,
            income: document.getElementById('income').value
        };

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
