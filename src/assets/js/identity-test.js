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
    userName: null,
    userPhone: null
  };

  // DOM Elements (will be initialized in initQuiz)
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
    resultAction: null,
    resultCareer: null,
    scoreOverview: null,
    combinationDescription: null,
    userInfoForm: null,
    userInfoFormElement: null,
    userNameInput: null,
    userEmailInput: null,
    userPhoneInput: null,
    skipUserInfoBtn: null
  };

  /**
   * Initialize the quiz system
   */
  function initQuiz() {
    // Initialize DOM elements
    elements.hero = document.getElementById('hero');
    elements.quiz = document.getElementById('quiz');
    elements.result = document.getElementById('result');
    elements.startBtn = document.getElementById('start-btn');
    elements.prevBtn = document.getElementById('prev-btn');
    elements.nextBtn = document.getElementById('next-btn');
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
    elements.resultAction = document.getElementById('result-action');
    elements.resultCareer = document.getElementById('result-career');
    elements.scoreOverview = document.getElementById('score-overview');
    elements.combinationDescription = document.getElementById('combination-description');
    elements.userInfoForm = document.getElementById('user-info-form');
    elements.userInfoFormElement = document.getElementById('user-info-form-element');
    elements.userNameInput = document.getElementById('user-name');
    elements.userEmailInput = document.getElementById('user-email');
    elements.userPhoneInput = document.getElementById('user-phone');
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
      console.error('Failed to load quiz data:', error);
      console.error('Data element:', document.getElementById('quiz-data'));
      showError('無法載入測驗資料，請重新整理頁面。錯誤：' + error.message);
      // Don't return - still bind event listeners so button can show error
    }

    // Event listeners - Always bind these, even if data loading failed
    if (elements.startBtn) {
      elements.startBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Start button clicked');
        if (!state.data || !state.data.questions) {
          showNotification('測驗資料尚未載入，請重新整理頁面');
          return;
        }
        startQuiz();
      });
    } else {
      console.error('Start button element not found');
    }
    
    if (elements.prevBtn) {
      elements.prevBtn.addEventListener('click', prevQuestion);
    }
    
    if (elements.nextBtn) {
      elements.nextBtn.addEventListener('click', nextQuestion);
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
    // Reset state
    state.currentQuestion = 0;
    state.answers = [];
    state.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    state.selectedOptions = [];
    state.userEmail = null;
    state.userName = null;
    state.userPhone = null;
    
    // Reset user info form if exists
    if (elements.userInfoFormElement) {
      elements.userInfoFormElement.reset();
    }

    // Hide hero, show quiz
    hideSection(elements.hero);
    showSection(elements.quiz);

    // Render first question
    renderQuestion();

    // Smooth scroll to quiz
    smoothScrollTo(elements.quiz);
  }

  /**
   * Render current question
   */
  function renderQuestion() {
    if (!state.data || !state.data.questions) {
      console.error('Cannot render question: data or questions missing', state.data);
      return;
    }

    const question = state.data.questions[state.currentQuestion];
    if (!question) {
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

    optionEl.addEventListener('click', () => selectOption(option, index, optionEl));

    return optionEl;
  }

  /**
   * Select an option (toggle behavior for multiple selection)
   */
  function selectOption(option, index, element) {
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

    // Save answer (複選陣列)
    state.answers[state.currentQuestion] = [...state.selectedOptions];

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
    // Validate selection: 至少需選 1 個選項
    if (state.selectedOptions.length === 0) {
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

    // Calculate from answers (每題答案為陣列)
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
    
    // Sort by score (descending)
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
   * Get Supabase configuration from meta tags
   */
  function getSupabaseConfig() {
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
    
    if (urlMeta && keyMeta) {
      return {
        url: urlMeta.content,
        anonKey: keyMeta.content
      };
    }
    
    console.warn('Supabase configuration not found in meta tags');
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
    state.userPhone = elements.userPhoneInput?.value.trim() || null;
    
    // If no data provided, just hide the form
    if (!state.userName && !state.userEmail && !state.userPhone) {
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
        phone: state.userPhone || null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      };

      const response = await fetch(`${config.url}/rest/v1/identity_test_results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(resultData)
      });

      if (!response.ok) {
        const errorText = await response.text();
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

    // Set narrative
    if (elements.resultNarrative) {
      elements.resultNarrative.textContent = primaryType.narrative;
    }

    // Set action advice (動作建議)
    if (elements.resultAction) {
      elements.resultAction.textContent = primaryType.actionAdvice || primaryType.photoAdvice || '';
    }

    // Set career advice
    if (elements.resultCareer) {
      elements.resultCareer.textContent = primaryType.careerAdvice;
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
          <span class="score-type">${typeName}</span>
          <span class="score-value">${score}</span>
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

    // 組合描述規則
    const combinationMap = {
      'I+C': '穩定型分析者，適合長期、結構化任務。你既有深度思考的能力，又能建立可靠的系統，是團隊中值得信賴的規劃者。',
      'A+E': '有表達力的創意型，適合對外曝光與創作結合。你既能用獨特視角創作，又擅長將作品推廣出去，是兼具創意與影響力的類型。',
      'S+E': '溫暖的影響者，擅長透過人際連結推動改變。你既能理解他人需求，又能帶領團隊前進，是理想的領導者與教練。',
      'R+I': '實作型研究者，能將理論轉化為實際成果。你既有動手能力，又有分析思維，適合技術研發與工程創新。',
      'A+S': '創意支持者，用美感與溫暖幫助他人。你既能創作有感的作品，又能透過人際互動傳達價值，適合教育與創作結合的領域。',
      'E+C': '策略組織者，能建立系統並推動執行。你既有領導力，又有組織能力，適合專案管理與營運優化。',
      'R+E': '行動領導者，能帶領團隊完成實務目標。你既有執行力，又有影響力，適合現場管理與業務拓展。',
      'I+S': '理性支持者，用邏輯與同理心幫助他人。你既能深度分析問題，又能溫暖地陪伴成長，適合諮商與研究結合的領域。',
      'A+C': '創意組織者，能將靈感轉化為可執行的系統。你既有美感，又有條理，適合設計管理與創意企劃。',
      'R+S': '實作支持者，用實際行動幫助他人。你既有動手能力，又有同理心，適合技術教學與實務輔導。',
      'I+E': '分析影響者，用深度見解推動決策。你既有研究能力，又有說服力，適合策略顧問與知識型創業。',
      'R+C': '實作組織者，能建立可靠的實務系統。你既有執行力，又有組織力，適合製造管理與品質控制。'
    };

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
    if (!section) return;
    section.classList.remove('hidden');
    section.classList.add('fade-in');
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
    // Simple notification (can be enhanced)
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
    console.log('Initializing identity test...');
    console.log('DOM ready state:', document.readyState);
    console.log('Start button exists:', !!document.getElementById('start-btn'));
    initQuiz();
    console.log('Identity test initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, but wait a bit to ensure all scripts are ready
    setTimeout(initialize, 100);
  }
})();
