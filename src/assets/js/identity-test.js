/**
 * Identity Archetype Test System - RIASEC-based
 * Gen Z friendly quiz system with scoring engine
 */

(function() {
  'use strict';

  // State management
  const state = {
    currentQuestion: 0,
    answers: [], // 每題答案為陣列，例如 [0, 2] 表示選了第 1、3 個選項
    scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
    data: null,
    selectedOptions: [], // 目前題目被勾選的選項 index 陣列
    // 用户信息
    userEmail: null,
    userName: null
  };

  const elements = {
    hero: null,
    quiz: null,
    result: null,
    startBtn: null,
    prevBtn: null,
    nextBtn: null,
    restartBtn: null,
    questionTitle: null,
    optionsGrid: null,
    progressBar: null,
    currentQuestion: null,
    totalQuestions: null,
    questionContainer: null,
    resultCard: null,
    resultIcon: null,
    resultTitle: null,
    resultSubtitle: null,
    resultNarrative: null,
    resultCoreDrive: null,
    resultBehaviors: null,
    resultTeamRole: null,
    resultSuitableSituations: null,
    resultGrowthDirection: null,
    resultBlindSpots: null,
    resultAction: null,
    scoreOverview: null,
    combinationDescription: null,
    userInfoForm: null,
    userInfoFormElement: null,
    userNameInput: null,
    userEmailInput: null,
    skipUserInfoBtn: null
  };

  /**
   * Initialize the quiz system
   */
  function initQuiz() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:59',message:'initQuiz() entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Initialize DOM elements
    elements.hero = document.getElementById('hero');
    elements.quiz = document.getElementById('quiz');
    elements.result = document.getElementById('result');
    elements.startBtn = document.getElementById('start-btn');
    elements.prevBtn = document.getElementById('prev-btn');
    elements.nextBtn = document.getElementById('next-btn');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:66',message:'DOM elements found',data:{hero:!!elements.hero,quiz:!!elements.quiz,result:!!elements.result,startBtn:!!elements.startBtn,prevBtn:!!elements.prevBtn,nextBtn:!!elements.nextBtn,heroHidden:elements.hero?.classList.contains('hidden'),quizHidden:elements.quiz?.classList.contains('hidden'),resultHidden:elements.result?.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    elements.restartBtn = document.getElementById('restart-btn');
    elements.questionTitle = document.getElementById('question-title');
    elements.optionsGrid = document.getElementById('options-grid');
    elements.progressBar = document.getElementById('progress-bar');
    elements.currentQuestion = document.getElementById('current-question');
    elements.totalQuestions = document.getElementById('total-questions');
    elements.questionContainer = document.querySelector('.question-container');
    elements.resultCard = document.getElementById('result-card');
    elements.resultIcon = document.getElementById('result-icon');
    elements.resultTitle = document.getElementById('result-title');
    elements.resultSubtitle = document.getElementById('result-subtitle');
    elements.resultNarrative = document.getElementById('result-narrative');
    elements.resultCoreDrive = document.getElementById('result-core-drive');
    elements.resultBehaviors = document.getElementById('result-behaviors');
    elements.resultTeamRole = document.getElementById('result-team-role');
    elements.resultSuitableSituations = document.getElementById('result-suitable-situations');
    elements.resultGrowthDirection = document.getElementById('result-growth-direction');
    elements.resultBlindSpots = document.getElementById('result-blind-spots');
    elements.resultAction = document.getElementById('result-action');
    elements.scoreOverview = document.getElementById('score-overview');
    elements.combinationDescription = document.getElementById('combination-description');
    elements.userInfoForm = document.getElementById('user-info-form');
    elements.userInfoFormElement = document.getElementById('user-info-form-element');
    elements.userNameInput = document.getElementById('user-name');
    elements.userEmailInput = document.getElementById('user-email');
    elements.skipUserInfoBtn = document.getElementById('skip-user-info');

    // Load data from JSON
    try {
      const dataElement = document.getElementById('quiz-data');
      if (!dataElement) {
        throw new Error('Quiz data element not found');
      }
      
      const dataText = dataElement.textContent.trim();
      if (!dataText || dataText === 'null') {
        throw new Error('Quiz data is empty or null');
      }
      
      state.data = JSON.parse(dataText);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:106',message:'Data parsed successfully',data:{hasData:!!state.data,hasQuestions:!!state.data?.questions,questionsCount:state.data?.questions?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Validate data structure
      if (!state.data || !state.data.questions || !Array.isArray(state.data.questions)) {
        throw new Error('Invalid quiz data structure');
      }
      
      if (state.data.questions.length === 0) {
        throw new Error('No questions found in quiz data');
      }
      
      // Set total questions
      if (elements.totalQuestions && state.data) {
        elements.totalQuestions.textContent = state.data.questions.length;
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:121',message:'Data loading failed',data:{error:error.message,dataElementExists:!!document.getElementById('quiz-data')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('Failed to load quiz data:', error);
      console.error('Data element:', document.getElementById('quiz-data'));
      showError('無法載入測驗資料，請重新整理頁面。錯誤：' + error.message);
    }

    // Event listeners - Always bind these, even if data loading failed
    if (elements.startBtn) {
      elements.startBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:129',message:'Start button clicked',data:{hasData:!!state.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('Start button clicked');
        if (!state.data || !state.data.questions) {
          showNotification('測驗資料尚未載入，請重新整理頁面');
          return;
        }
        startQuiz();
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:138',message:'Start button listener bound',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:139',message:'Start button NOT found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Start button element not found');
    }
    
    if (elements.prevBtn) {
      elements.prevBtn.addEventListener('click', function(e) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:142',message:'Prev button clicked',data:{disabled:elements.prevBtn.disabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        prevQuestion();
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:143',message:'Prev button listener bound',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    
    if (elements.nextBtn) {
      elements.nextBtn.addEventListener('click', function(e) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:147',message:'Next button clicked',data:{disabled:elements.nextBtn.disabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        nextQuestion();
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:151',message:'Next button listener bound',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    
    if (elements.restartBtn) {
      elements.restartBtn.addEventListener('click', restartQuiz);
    }
    
    // User info form handlers
    if (elements.userInfoFormElement) {
      elements.userInfoFormElement.addEventListener('submit', handleUserInfoSubmit);
    }
    
    if (elements.skipUserInfoBtn) {
      elements.skipUserInfoBtn.addEventListener('click', handleSkipUserInfo);
    }
  }

  /**
   * Start the quiz
   */
  function startQuiz() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:167',message:'startQuiz() called',data:{hasData:!!state.data,heroExists:!!elements.hero,quizExists:!!elements.quiz},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Reset state
    state.currentQuestion = 0;
    state.answers = [];
    state.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    state.selectedOptions = [];
    state.userEmail = null;
    state.userName = null;
    
    // Reset user info form if exists
    if (elements.userInfoFormElement) {
      elements.userInfoFormElement.reset();
    }

    // Hide hero, show quiz
    hideSection(elements.hero);
    showSection(elements.quiz);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:183',message:'Sections shown/hidden',data:{heroHidden:elements.hero?.classList.contains('hidden'),quizHidden:elements.quiz?.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Render first question
    renderQuestion();

    // Smooth scroll to quiz
    smoothScrollTo(elements.quiz);
  }

  /**
   * Render current question
   */
  function renderQuestion() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:228',message:'renderQuestion() called',data:{hasData:!!state.data,hasQuestions:!!state.data?.questions,currentQuestion:state.currentQuestion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (!state.data || !state.data.questions) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:229',message:'renderQuestion() failed - no data',data:{hasData:!!state.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('Cannot render question: data or questions missing', state.data);
      return;
    }

    const question = state.data.questions[state.currentQuestion];
    if (!question) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:235',message:'renderQuestion() failed - no question',data:{currentQuestion:state.currentQuestion,questionsLength:state.data.questions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Cannot render question: question not found at index', state.currentQuestion);
      return;
    }

    // Update question title
    if (elements.questionTitle) {
      elements.questionTitle.textContent = question.text || '題目載入中...';
    } else {
      console.error('Question title element not found');
    }

    // Update question counter
    if (elements.currentQuestion) {
      elements.currentQuestion.textContent = state.currentQuestion + 1;
    }

    // Clear options grid
    if (elements.optionsGrid) {
      elements.optionsGrid.innerHTML = '';
    } else {
      console.error('Options grid element not found');
      return;
    }

    // Render options with fade-in animation
    if (!question.options || !Array.isArray(question.options)) {
      console.error('Question options missing or not an array', question);
      return;
    }

    question.options.forEach((option, index) => {
      const optionEl = createOptionElement(option, index);
      if (elements.optionsGrid && optionEl) {
        elements.optionsGrid.appendChild(optionEl);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:234',message:'Option element created and appended',data:{index:index,hasClickListener:!!optionEl.onclick},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // Stagger animation
        setTimeout(() => {
          optionEl.classList.add('fade-in');
        }, index * 50);
      }
    });

    // Restore previous answer if exists
    if (state.answers[state.currentQuestion] !== undefined) {
      state.selectedOptions = [...state.answers[state.currentQuestion]];
      highlightSelectedOptions();
    } else {
      state.selectedOptions = [];
    }

    // Update navigation buttons
    updateNavigationButtons();
    updateProgress();
  }

  /**
   * Create option element
   */
  function createOptionElement(option, index) {
    const optionEl = document.createElement('button');
    optionEl.className = 'option-card';
    optionEl.type = 'button';
    optionEl.setAttribute('data-type', option.type);
    optionEl.setAttribute('data-index', index);
    
    optionEl.innerHTML = `
      <span class="option-text">${option.text}</span>
    `;

    optionEl.addEventListener('click', () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:271',message:'Option clicked',data:{index:index,currentSelected:state.selectedOptions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      selectOption(option, index, optionEl);
    });

    return optionEl;
  }

  /**
   * Select an option (toggle behavior for multiple selection)
   */
  function selectOption(option, index, element) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:329',message:'selectOption() called',data:{index:index,isSelected:state.selectedOptions.includes(index),currentSelectedCount:state.selectedOptions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Toggle selection: 如果已選則取消，未選則加入
    const isSelected = state.selectedOptions.includes(index);
    
    if (isSelected) {
      // 取消選取
      state.selectedOptions = state.selectedOptions.filter(i => i !== index);
      element.classList.remove('selected');
    } else {
      // 加入選取
      state.selectedOptions.push(index);
      element.classList.add('selected');
    }

    state.answers[state.currentQuestion] = [...state.selectedOptions];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:343',message:'Option selection updated',data:{selectedCount:state.selectedOptions.length,answerCount:state.answers[state.currentQuestion]?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Update navigation
    updateNavigationButtons();

    // Trigger scale animation
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 150);
  }

  /**
   * Highlight previously selected options (multiple)
   */
  function highlightSelectedOptions() {
    if (!state.selectedOptions || state.selectedOptions.length === 0) return;

    state.selectedOptions.forEach(index => {
      const optionEl = elements.optionsGrid?.querySelector(
        `.option-card[data-index="${index}"]`
      );
      if (optionEl) {
        optionEl.classList.add('selected');
      }
    });
  }

  /**
   * Go to next question
   */
  function nextQuestion() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:380',message:'nextQuestion() called',data:{selectedOptionsCount:state.selectedOptions.length,currentQuestion:state.currentQuestion,totalQuestions:state.data?.questions?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Validate selection: 至少需選 1 個選項
    if (state.selectedOptions.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:382',message:'nextQuestion() blocked - no selection',data:{selectedOptionsCount:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      showNotification('請至少選擇一個選項');
      return;
    }

    // Move to next question
    if (state.currentQuestion < state.data.questions.length - 1) {
      // Fade out current question
      if (elements.questionContainer) {
        elements.questionContainer.classList.add('fade-out');
      }

      setTimeout(() => {
        state.currentQuestion++;
        state.selectedOptions = [];
        renderQuestion();

        // Fade in new question
        if (elements.questionContainer) {
          elements.questionContainer.classList.remove('fade-out');
          elements.questionContainer.classList.add('fade-in');
        }
      }, 200);
    } else {
      // Finish quiz
      finishQuiz();
    }

    smoothScrollTo(elements.quiz);
  }

  /**
   * Go to previous question
   */
  function prevQuestion() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:416',message:'prevQuestion() called',data:{currentQuestion:state.currentQuestion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (state.currentQuestion > 0) {
      // Fade out current question
      if (elements.questionContainer) {
        elements.questionContainer.classList.add('fade-out');
      }

      setTimeout(() => {
        state.currentQuestion--;
        state.selectedOptions = [];
        renderQuestion();

        // Fade in previous question
        if (elements.questionContainer) {
          elements.questionContainer.classList.remove('fade-out');
          elements.questionContainer.classList.add('fade-in');
        }
      }, 200);
    }

    smoothScrollTo(elements.quiz);
  }

  /**
   * Update navigation buttons state
   */
  function updateNavigationButtons() {
    // Previous button
    if (elements.prevBtn) {
      elements.prevBtn.disabled = state.currentQuestion === 0;
    }

    // Next button: 至少需選 1 個選項才能繼續
    if (elements.nextBtn) {
      const hasSelection = state.selectedOptions.length > 0;
      const isLastQuestion = state.currentQuestion === state.data.questions.length - 1;
      elements.nextBtn.disabled = !hasSelection;
      elements.nextBtn.textContent = isLastQuestion ? '查看結果' : '下一題';
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:396',message:'Navigation buttons updated',data:{hasSelection:hasSelection,nextBtnDisabled:elements.nextBtn.disabled,currentQuestion:state.currentQuestion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }
  }

  /**
   * Update progress bar
   */
  function updateProgress() {
    if (!elements.progressBar || !state.data) return;

    const total = state.data.questions.length;
    const current = state.currentQuestion + 1;
    const progress = (current / total) * 100;

    elements.progressBar.style.width = `${progress}%`;
  }

  /**
   * Calculate scores from answers (支援複選)
   */
  function calculateScores() {
    // Reset scores
    state.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    state.answers.forEach((answerIndices, questionIndex) => {
      const question = state.data.questions[questionIndex];
      if (question && Array.isArray(answerIndices)) {
        // 遍歷該題所有被選的選項
        answerIndices.forEach(optionIndex => {
          if (question.options[optionIndex]) {
            const type = question.options[optionIndex].type;
            state.scores[type] = (state.scores[type] || 0) + 1;
          }
        });
      }
    });
  }

  /**
   * Find winner type(s) - 最高分為主類型，次高分為副類型
   */
  function findWinnerType() {
    const scores = state.scores;
    const scoreArray = Object.entries(scores);
    
    scoreArray.sort((a, b) => {
      // 分數相同時，維持原本順序（R, I, A, S, E, C）
      if (b[1] === a[1]) {
        const order = ['R', 'I', 'A', 'S', 'E', 'C'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      }
      return b[1] - a[1];
    });

    const maxScore = scoreArray[0][1];
    
    // 如果所有分數都是 0，保護機制
    if (maxScore === 0) {
      return {
        resultType: 'R',
        secondaryType: null,
        scores: scores
      };
    }

    // 主類型：最高分
    const primaryType = scoreArray[0][0];
    
    // 副類型：次高分（如果存在且分數 > 0）
    const secondaryType = scoreArray.length > 1 && scoreArray[1][1] > 0 
      ? scoreArray[1][0] 
      : null;

    return {
      resultType: primaryType,
      secondaryType: secondaryType,
      scores: scores
    };
  }

  /**
   * Get Supabase configuration from window object (injected by template)
   */
  function getSupabaseConfig() {
    if (window.supabaseConfig && window.supabaseConfig.url && window.supabaseConfig.anonKey) {
      const url = window.supabaseConfig.url.trim();
      const key = window.supabaseConfig.anonKey.trim();
      
      // Validate that values are actual strings, not template variables
      if (!url || url.startsWith('{{') || !key || key.startsWith('{{')) {
        console.warn('Supabase configuration appears to be template variables, not actual values');
        return null;
      }
      
      return {
        url: url,
        anonKey: key
      };
    }
    
    console.warn('Supabase configuration not found on window.supabaseConfig');
    console.warn('Available window.supabaseConfig:', window.supabaseConfig);
    return null;
  }

  /**
   * Handle user info form submission
   */
  function handleUserInfoSubmit(e) {
    e.preventDefault();
    
    // Get form values
    state.userName = elements.userNameInput?.value.trim() || null;
    state.userEmail = elements.userEmailInput?.value.trim() || null;
    
    // If no data provided, just hide the form
    if (!state.userName && !state.userEmail) {
      hideUserInfoForm();
      return;
    }
    
    // Validate email if provided
    if (state.userEmail && !isValidEmail(state.userEmail)) {
      showNotification('請輸入有效的 Email 地址', 'error');
      return;
    }
    
    // Save with updated user info
    const result = findWinnerType();
    saveResult(result).then(() => {
      showNotification('資訊已儲存！', 'success');
      hideUserInfoForm();
    }).catch(err => {
      console.error('Failed to save user info:', err);
      showNotification('儲存失敗，請稍後再試', 'error');
    });
  }
  
  /**
   * Handle skip user info
   */
  function handleSkipUserInfo() {
    hideUserInfoForm();
  }
  
  /**
   * Hide user info form
   */
  function hideUserInfoForm() {
    if (elements.userInfoForm) {
      elements.userInfoForm.style.display = 'none';
    }
  }
  
  /**
   * Validate email format
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Save quiz result to Supabase
   */
  async function saveResult(result) {
    try {
      const config = getSupabaseConfig();
      
      if (!config || !config.url || !config.anonKey) {
        console.warn('Supabase config not found, skipping save');
        return;
      }

      const resultData = {
        result_type: result.resultType,
        secondary_type: result.secondaryType || null,
        scores: state.scores,
        answers: state.answers,
        email: state.userEmail || null,
        name: state.userName || null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      };

      const apiUrl = `${config.url}/rest/v1/identity_test_results`;
      
      console.log('📤 Saving to Supabase:', {
        url: apiUrl,
        hasData: !!resultData,
        resultType: resultData.result_type,
        hasEmail: !!resultData.email,
        hasName: !!resultData.name
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(resultData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Supabase API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: apiUrl,
          configUrl: config.url,
          configKeyLength: config.anonKey ? config.anonKey.length : 0,
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.anonKey ? '***' + config.anonKey.slice(-4) : 'missing',
            'Authorization': config.anonKey ? 'Bearer ***' + config.anonKey.slice(-4) : 'missing'
          }
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ Quiz result saved to Supabase successfully');
      
      // 触发自定义事件，可用于分析或通知
      window.dispatchEvent(new CustomEvent('quizResultSaved', {
        detail: resultData
      }));
      
    } catch (error) {
      console.error('❌ Error saving quiz result to Supabase:', error);
      // 如果是在用户提交表单时出错，需要抛出错误以便显示提示
      throw error;
    }
  }

  /**
   * Finish quiz and show result
   */
  function finishQuiz() {
    // Set progress to 100% when quiz is finished
    if (elements.progressBar && state.data) {
      elements.progressBar.style.width = '100%';
    }
    // Calculate scores
    calculateScores();

    // Find winner
    const result = findWinnerType();

    // 先保存基本信息（不包含用户信息）
    // 用户信息会在表单提交时再次保存更新
    saveResult(result).catch(err => {
      console.error('Failed to save initial result:', err);
    });

    // Render result
    renderResult(result);

    // Hide quiz, show result
    hideSection(elements.quiz);
    showSection(elements.result);

    // Smooth scroll to result
    smoothScrollTo(elements.result);
  }

  /**
   * Render result page
   */
  function renderResult(result) {
    if (!state.data || !state.data.types) return;

    const primaryType = state.data.types[result.resultType];
    if (!primaryType) return;

    // Set icon
    if (elements.resultIcon) {
      elements.resultIcon.textContent = primaryType.icon;
    }

    // Set title
    if (elements.resultTitle) {
      elements.resultTitle.textContent = `你的原型是：${primaryType.name}（${result.resultType}）`;
    }

    // Set subtitle
    if (elements.resultSubtitle) {
      let subtitle = primaryType.english;
      if (result.secondaryType) {
        const secondaryType = state.data.types[result.secondaryType];
        if (secondaryType) {
          subtitle += ` × ${secondaryType.name}（${secondaryType.english}）`;
        }
      }
      elements.resultSubtitle.textContent = subtitle;
    }

    if (elements.resultNarrative) {
      elements.resultNarrative.textContent = primaryType.narrative;
    }

    if (elements.resultCoreDrive) {
      elements.resultCoreDrive.textContent = primaryType.coreDrive || '';
    }

    if (elements.resultBehaviors && primaryType.behaviors && Array.isArray(primaryType.behaviors)) {
      const behaviorsHTML = primaryType.behaviors.map(behavior => 
        `<li>${behavior}</li>`
      ).join('');
      elements.resultBehaviors.innerHTML = `<ul>${behaviorsHTML}</ul>`;
    }

    if (elements.resultTeamRole) {
      let teamRoleText = primaryType.teamRole || '';
      if (primaryType.teamRoleDescription) {
        teamRoleText += `：${primaryType.teamRoleDescription}`;
      }
      elements.resultTeamRole.textContent = teamRoleText;
    }

    if (elements.resultSuitableSituations && primaryType.suitableSituations && Array.isArray(primaryType.suitableSituations)) {
      const situationsHTML = primaryType.suitableSituations.map(situation => 
        `<li>${situation}</li>`
      ).join('');
      elements.resultSuitableSituations.innerHTML = `<ul>${situationsHTML}</ul>`;
    }

    if (elements.resultGrowthDirection && primaryType.growthDirection && Array.isArray(primaryType.growthDirection)) {
      const growthHTML = primaryType.growthDirection.map(direction => 
        `<li>${direction}</li>`
      ).join('');
      elements.resultGrowthDirection.innerHTML = `<ul>${growthHTML}</ul>`;
    }

    if (elements.resultBlindSpots && primaryType.blindSpots && Array.isArray(primaryType.blindSpots)) {
      const blindSpotsHTML = primaryType.blindSpots.map(spot => 
        `<li>${spot}</li>`
      ).join('');
      elements.resultBlindSpots.innerHTML = `<ul>${blindSpotsHTML}</ul>`;
    }

    if (elements.resultAction) {
      elements.resultAction.textContent = primaryType.actionAdvice || '';
    }

    // Render score overview and combination description
    renderScoreOverview(result);
    renderCombinationDescription(result);

    // Apply type color
    if (elements.resultCard) {
      elements.resultCard.style.setProperty('--type-color', primaryType.color);
    }

    // Trigger stagger animation
    setTimeout(() => {
      const staggerItems = document.querySelectorAll('.stagger-item');
      staggerItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('fade-in');
        }, index * 150);
      });
    }, 100);
  }

  /**
   * Render score overview (分數總覽)
   */
  function renderScoreOverview(result) {
    if (!elements.scoreOverview) return;

    const scores = result.scores;
    const typeNames = {
      R: '行動型 (R)',
      I: '分析型 (I)',
      A: '創意型 (A)',
      S: '社會型 (S)',
      E: '影響型 (E)',
      C: '秩序型 (C)'
    };

    // 建立分數列表 HTML
    let scoreListHTML = '<div class="score-list">';
    const scoreArray = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    scoreArray.forEach(([type, score]) => {
      const typeName = typeNames[type] || type;
      scoreListHTML += `
        <div class="score-item">
          <span class="score-item-name">${typeName}</span>
          <span class="score-item-value">${score}</span>
        </div>
      `;
    });
    scoreListHTML += '</div>';

    // 建立分數文字描述
    const scoreText = Object.entries(scores)
      .map(([type, score]) => `${type}=${score}`)
      .join(', ');
    
    elements.scoreOverview.innerHTML = `
      <p class="score-summary">你的 RIASEC 分數分佈為：${scoreText}</p>
      ${scoreListHTML}
    `;
  }

  /**
   * Render combination description (組合說明)
   */
  function renderCombinationDescription(result) {
    if (!elements.combinationDescription) return;

    const primaryType = result.resultType;
    const secondaryType = result.secondaryType;

    if (!secondaryType) {
      // 只有主類型
      const typeData = state.data.types[primaryType];
      if (typeData) {
        elements.combinationDescription.innerHTML = `
          <p class="combination-text">
            你的主類型是<strong>${typeData.name}（${primaryType}）</strong>，這是你最核心的人格特質。
          </p>
        `;
      }
      return;
    }

    // 主類型 + 副類型組合
    const primaryData = state.data.types[primaryType];
    const secondaryData = state.data.types[secondaryType];

    if (!primaryData || !secondaryData) return;

    // 從 JSON 資料中讀取組合描述規則（專業職涯諮詢＋心理敘事版）
    const combinationMap = state.data.combinations || {};

    const combinationKey1 = `${primaryType}+${secondaryType}`;
    const combinationKey2 = `${secondaryType}+${primaryType}`;
    
    let description = combinationMap[combinationKey1] || combinationMap[combinationKey2];
    
    if (!description) {
      // 通用句型
      description = `你同時帶有<strong>${primaryData.name}（${primaryType}）</strong>與<strong>${secondaryData.name}（${secondaryType}）</strong>的特質，既有${primaryData.name}的${getTypeTrait(primaryType)}，又有${secondaryData.name}的${getTypeTrait(secondaryType)}，形成獨特的人格組合。`;
    } else {
      description = `主類型：<strong>${primaryData.name}（${primaryType}）</strong>＋副類型：<strong>${secondaryData.name}（${secondaryType}）</strong>＝${description}`;
    }

    elements.combinationDescription.innerHTML = `<p class="combination-text">${description}</p>`;
  }

  /**
   * Get type trait for generic description
   */
  function getTypeTrait(type) {
    const traits = {
      R: '實作能力',
      I: '分析思維',
      A: '創意表達',
      S: '同理心',
      E: '影響力',
      C: '組織力'
    };
    return traits[type] || '特質';
  }

  /**
   * Restart quiz
   */
  function restartQuiz() {
    // Reset state
    state.currentQuestion = 0;
    state.answers = [];
    state.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    state.selectedOptions = [];

    // Hide result, show hero
    hideSection(elements.result);
    showSection(elements.hero);

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Show section with animation
   */
  function showSection(section) {
    if (!section) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:885',message:'showSection called with null section',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      return;
    }
    section.classList.remove('hidden');
    section.classList.add('fade-in');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:888',message:'Section shown',data:{sectionId:section.id,hasHidden:section.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
  }

  /**
   * Hide section
   */
  function hideSection(section) {
    if (!section) return;
    section.classList.add('hidden');
    section.classList.remove('fade-in', 'fade-out');
  }

  /**
   * Smooth scroll to element
   */
  function smoothScrollTo(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Show notification
   */
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Show error message
   */
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
  }

  // Initialize when DOM is ready
  function initialize() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:942',message:'initialize() called',data:{readyState:document.readyState,startBtnExists:!!document.getElementById('start-btn')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('Initializing identity test...');
    console.log('DOM ready state:', document.readyState);
    console.log('Start button exists:', !!document.getElementById('start-btn'));
    initQuiz();
    
    // Ensure quiz and result sections are hidden on initialization
    if (elements.quiz) {
      elements.quiz.classList.add('hidden');
    }
    if (elements.result) {
      elements.result.classList.add('hidden');
    }
    // Ensure hero section is visible
    if (elements.hero) {
      elements.hero.classList.remove('hidden');
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:947',message:'initQuiz() completed',data:{hasData:!!state.data,questionsCount:state.data?.questions?.length,heroHidden:elements.hero?.classList.contains('hidden'),quizHidden:elements.quiz?.classList.contains('hidden'),resultHidden:elements.result?.classList.contains('hidden')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('Identity test initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, but wait a bit to ensure all scripts are ready
    setTimeout(initialize, 100);
  }
})();
