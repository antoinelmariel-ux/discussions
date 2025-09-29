class DiscussionCardGame {
  constructor(){
    this.persistenceVersion = 3;
    const { cards, variationMap } = this.loadCardsFromXML();
    this.allCards = cards;
    this.variationMap = variationMap;
    this.masteredPrinciples = new Set();
    this.favoriteAdviceIds = new Set();
    this.activeCategories = new Set(this.getAllCategories());
    this.recomputeActiveCards();
    this.availableCards = [...this.cards];
    this.usedCards = [];
    this.currentCard = null;
    this.activeExpertCard = null;
    this.welcomeCard = {
      category:'Bienvenue',
      content:'Cliquez sur le tas de cartes pour découvrir votre première question de discussion !'
    };
    this.cardEl = document.getElementById('discussionCard');
    this.cardCategoryEl = document.getElementById('cardCategory');
    this.cardContentEl = document.getElementById('cardContent');
    this.cardVariationLabelEl = document.getElementById('cardVariationLabel');
    this.deckEl = document.getElementById('cardDeck');
    this.counterEl = document.getElementById('cardCounter');
    this.cardContainerEl = document.getElementById('cardContainer');
    this.floatingParticlesContainer = document.querySelector('.floating-particles');
    this.themeModalEl = document.getElementById('themeSelectorModal');
    this.themeOptionsEl = document.getElementById('themeOptions');
    this.themeErrorEl = document.getElementById('themeError');
    this.selectAllEl = document.getElementById('selectAllThemes');
    this.applyThemeSelectionBtn = document.getElementById('applyThemeSelection');
    this.openThemeSelectorBtn = document.getElementById('openThemeSelector');
    this.closeThemeSelectorBtn = document.getElementById('closeThemeSelector');
    this.expertAdviceBtn = document.getElementById('expertAdviceBtn');
    this.expertAdviceModalEl = document.getElementById('expertAdviceModal');
    this.expertAdviceCategoryEl = document.getElementById('expertAdviceCategory');
    this.expertAdviceVariationEl = document.getElementById('expertAdviceVariation');
    this.expertAdviceSituationEl = document.getElementById('expertAdviceSituation');
    this.expertAdviceContentEl = document.getElementById('expertAdviceContent');
    this.closeExpertAdviceBtn = document.getElementById('closeExpertAdvice');
    this.favoriteToggleBtn = document.getElementById('toggleFavorite');
    this.favoriteStatusEl = document.getElementById('favoriteStatus');
    this.masterySectionEl = document.getElementById('expertMasterySection');
    this.masteryStatusEl = document.getElementById('expertMasteryStatus');
    this.masteryActionButtons = Array.from(document.querySelectorAll('.mastery-action'));
    this.saveSessionBtn = document.getElementById('saveSession');
    this.loadSessionBtn = document.getElementById('loadSession');
    this.sessionFileInput = document.getElementById('sessionFileInput');
    this.openFavoritesBtn = document.getElementById('openFavorites');
    this.favoritesModalEl = document.getElementById('favoritesModal');
    this.favoritesListEl = document.getElementById('favoritesList');
    this.closeFavoritesBtns = Array.from(document.querySelectorAll('#closeFavorites, #closeFavoritesFooter'));
    this.advancedMenuToggle = document.getElementById('advancedMenuToggle');
    this.advancedMenu = document.getElementById('advancedMenu');
    this.advancedMenuWrapper = this.advancedMenuToggle ? this.advancedMenuToggle.closest('.controls-menu') : null;
    this.cardStatusEl = document.getElementById('cardStatus');
    this.themeTriggerElement = null;
    this.expertTriggerElement = null;
    this.favoritesTriggerElement = null;
    this.favoriteAnimationTimeout = null;
    this.handleDeckKeyPress = this.handleDeckKeyPress.bind(this);
    this.handleCardKeyPress = this.handleCardKeyPress.bind(this);
    this.handleGlobalKeyPress = this.handleGlobalKeyPress.bind(this);
    this.updateCounter();
    this.createFloatingParticles();
    this.prepareWelcomeCard();
    this.populateThemeOptions();
    this.bindThemeSelectorEvents();
    this.bindExpertAdviceEvents();
    this.bindMasteryEvents();
    this.bindPersistenceEvents();
    this.bindAdvancedMenuEvents();
    this.bindFavoritesEvents();
    this.bindAccessibilityInteractions();
    this.setExpertButtonState(false);
  }

  prepareWelcomeCard(){
    this.currentCard = this.welcomeCard;
    this.activeExpertCard = null;
    if(this.cardEl){ this.cardEl.classList.remove('flipping'); }
    this.updateCardFlipState(false);
    if(this.cardCategoryEl){ this.cardCategoryEl.textContent = this.welcomeCard.category; }
    if(this.cardContentEl){ this.cardContentEl.textContent = this.welcomeCard.content; }
    if(this.cardVariationLabelEl){ this.cardVariationLabelEl.textContent=''; }
    this.hideExpertAdvice();
    this.clearExpertAdvicePanel();
    this.setExpertButtonState(false);
    this.updateStatus('Carte de bienvenue affichée.');
  }

  loadCardsFromXML(){
    const xmlData = document.getElementById('cardsData').textContent;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData,'text/xml');
    const nodes = xmlDoc.querySelectorAll('card');
    const cards = [];
    const variationMap = new Map();
    let idCounter = 0;
    nodes.forEach(cardNode=>{
      const contentNode = cardNode.querySelector('content');
      const adviceNode = cardNode.querySelector('advice');
      const adviceText = adviceNode ? adviceNode.textContent.trim() : '';
      const baseId = idCounter++;
      const baseCard = {
        id: baseId,
        category: cardNode.getAttribute('category'),
        content: contentNode ? contentNode.textContent.trim() : '',
        advice: adviceText,
        type: 'base'
      };
      cards.push(baseCard);

      const variationNodes = cardNode.querySelectorAll('variations > variation');
      if(variationNodes.length>0){
        const variationIds = [];
        variationNodes.forEach((variationNode,index)=>{
          const variationContent = variationNode.textContent.trim();
          if(!variationContent) return;
          const variationCard = {
            id: idCounter++,
            category: baseCard.category,
            content: variationContent,
            advice: adviceText,
            type: 'variation',
            variationOf: baseId,
            variationLabel: variationNode.getAttribute('title') || `Variante ${index+1}`
          };
          cards.push(variationCard);
          variationIds.push(variationCard.id);
        });
        if(variationIds.length>0){
          variationMap.set(baseId, variationIds);
        }
      }
    });
    return { cards, variationMap };
  }

  bindPersistenceEvents(){
    if(this.saveSessionBtn){
      this.saveSessionBtn.addEventListener('click', ()=> this.exportSessionState());
    }
    if(this.loadSessionBtn && this.sessionFileInput){
      this.loadSessionBtn.addEventListener('click', ()=>{
        this.sessionFileInput.value='';
        this.sessionFileInput.click();
      });
      this.sessionFileInput.addEventListener('change', event=>{
        const [file] = event.target.files || [];
        if(file){
          this.importSessionState(file);
        }
      });
    }
  }

  bindAdvancedMenuEvents(){
    if(!this.advancedMenuToggle || !this.advancedMenu || !this.advancedMenuWrapper) return;

    const closeMenu = (restoreFocus=false)=>{
      if(!this.advancedMenuWrapper.classList.contains('open')) return;
      this.advancedMenuWrapper.classList.remove('open');
      this.advancedMenuToggle.setAttribute('aria-expanded','false');
      if(restoreFocus){
        this.advancedMenuToggle.focus();
      }
    };

    const openMenu = ()=>{
      this.advancedMenuWrapper.classList.add('open');
      this.advancedMenuToggle.setAttribute('aria-expanded','true');
    };

    const toggleMenu = ()=>{
      const isOpen = this.advancedMenuWrapper.classList.toggle('open');
      this.advancedMenuToggle.setAttribute('aria-expanded', String(isOpen));
      if(isOpen){
        const firstAction = this.advancedMenu.querySelector('button');
        if(firstAction){
          firstAction.focus();
        }
      }
    };

    this.advancedMenuToggle.addEventListener('click', event=>{
      event.stopPropagation();
      toggleMenu();
    });

    this.advancedMenuToggle.addEventListener('keydown', event=>{
      if(event.key==='ArrowDown' || event.key==='Enter' || event.key===' '){
        event.preventDefault();
        if(!this.advancedMenuWrapper.classList.contains('open')){
          openMenu();
        }
        const firstAction = this.advancedMenu.querySelector('button');
        if(firstAction){
          firstAction.focus();
        }
      }
    });

    this.advancedMenu.addEventListener('click', event=>{
      const target = event.target;
      if(target instanceof HTMLElement && target.matches('button')){
        closeMenu(true);
      }
    });

    this.advancedMenu.addEventListener('keydown', event=>{
      if(event.key==='Escape'){
        event.stopPropagation();
        closeMenu(true);
      }
    });

    document.addEventListener('click', event=>{
      const target = event.target;
      if(target instanceof Node && this.advancedMenuWrapper.contains(target)){
        return;
      }
      closeMenu(false);
    });

    document.addEventListener('keydown', event=>{
      if(event.key==='Escape' && this.advancedMenuWrapper.classList.contains('open')){
        event.stopPropagation();
        closeMenu(true);
      }
    });
  }

  _takeRandomCard(){
    if(this.availableCards.length===0){
      this.updateCounter();
      return null;
    }
    const index = Math.floor(Math.random()*this.availableCards.length);
    const card = this.availableCards[index];
    this.usedCards.push(card);
    this.availableCards.splice(index,1);
    this.updateCounter();
    return card;
  }

  drawCard(){
    const card = this._takeRandomCard();
    if(!card){
      this.showNoMoreCards();
      return null;
    }
    this.animateDeck();
    this.currentCard = card;
    this.hideExpertAdvice();
    this.prepareAndFlipCard(card);
    this.setExpertButtonState(Boolean(card.advice));
    this.activeExpertCard = null;
    const remainingMessage = this.formatRemainingCardsMessage(this.availableCards.length);
    this.updateStatus(`Carte tirée : ${card.category}. ${remainingMessage}.`);
    return card;
  }

  drawRandomCard(){
    const card = this._takeRandomCard();
    if(!card){ this.showNoMoreCards(); return null; }
    return card;
  }

  prepareAndFlipCard(card){
    this.hideExpertAdvice();
    if(this.cardEl.classList.contains('flipping')){
      this.cardEl.classList.remove('flipping');
      this.updateCardFlipState(false);
      setTimeout(()=>{
        this.updateCardContent(card);
        this.flipCard();
      },400);
    }else{
      this.updateCardContent(card);
      this.flipCard();
    }
  }

  updateCardContent(card){
    if(this.cardCategoryEl){
      this.cardCategoryEl.textContent = card.category;
    }
    if(this.cardVariationLabelEl){
      if(card.type==='variation'){
        this.cardVariationLabelEl.textContent = card.variationLabel || 'Variante';
      }else{
        this.cardVariationLabelEl.textContent = '';
      }
    }
    if(this.cardContentEl){
      this.cardContentEl.textContent = card.content;
    }
    this.clearExpertAdvicePanel();
  }

  flipCard(){
    setTimeout(()=>{
      this.cardEl.classList.add('flipping');
      this.updateCardFlipState(true);
    },100);
  }

  animateDeck(){
    this.deckEl.style.transform='scale(0.95) translateY(5px)';
    setTimeout(()=>{ this.deckEl.style.transform='scale(1) translateY(0)'; },150);
  }

  updateCounter(){
    this.counterEl.textContent = this.availableCards.length;
  }

  resetDeck(){
    this.recomputeActiveCards();
    this.availableCards=[...this.cards];
    this.usedCards=[];
    this.updateCounter();
    this.prepareWelcomeCard();
    this.hideExpertAdvice();
    const remainingMessage = this.formatRemainingCardsMessage(this.availableCards.length);
    this.updateStatus(`Le paquet a été réinitialisé : ${remainingMessage}.`);
  }

  showNoMoreCards(){
    this.cardEl.classList.remove('flipping');
    this.updateCardFlipState(false);
    setTimeout(()=>{
      this.cardCategoryEl.textContent='Fin du Jeu';
      this.cardContentEl.textContent='Toutes les cartes ont été piochées ! Cliquez sur "Réinitialiser" pour recommencer.';
      setTimeout(()=>{
        this.cardEl.classList.add('flipping');
        this.updateCardFlipState(true);
      },100);
    },400);
    this.updateStatus('Toutes les cartes ont été piochées : aucune carte restante. Réinitialisez pour recommencer.');
  }

  createFloatingParticles(){
    const container = this.floatingParticlesContainer;
    if(!container) return;
    for(let i=0;i<20;i++){
      const p = document.createElement('div');
      p.className='particle';
      p.style.left = Math.random()*100+'%';
      p.style.animationDelay = Math.random()*6+'s';
      p.style.animationDuration = (Math.random()*3+3)+'s';
      container.appendChild(p);
    }
  }

  recomputeActiveCards(){
    this.cards = this.allCards.filter(card=>{
      if(!this.activeCategories.has(card.category)){
        return false;
      }
      if(card.type==='variation' && this.masteredPrinciples.has(card.variationOf)){
        return false;
      }
      return true;
    });
  }

  refreshDeckAfterMasteryChange(){
    this.recomputeActiveCards();
    const activeIds = new Set(this.cards.map(card=>card.id));
    this.availableCards = this.availableCards.filter(card=>activeIds.has(card.id));
    this.usedCards = this.usedCards.filter(card=>activeIds.has(card.id));
    const presentIds = new Set([...this.availableCards, ...this.usedCards].map(card=>card.id));
    this.cards.forEach(card=>{
      if(!presentIds.has(card.id)){
        this.availableCards.push(card);
      }
    });
    this.updateCounter();
  }

  getAllCategories(){
    return Array.from(new Set(this.allCards.map(card=>card.category))).sort();
  }

  populateThemeOptions(){
    if(!this.themeOptionsEl) return;
    const categories = this.getAllCategories();
    this.themeOptionsEl.innerHTML='';
    categories.forEach(category=>{
      const optionId = `theme-${category.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
      const label = document.createElement('label');
      label.className='theme-option';
      label.setAttribute('for', optionId);

      const checkbox = document.createElement('input');
      checkbox.type='checkbox';
      checkbox.id = optionId;
      checkbox.value = category;
      checkbox.checked = this.activeCategories.has(category);

      const span = document.createElement('span');
      span.textContent = category;

      label.appendChild(checkbox);
      label.appendChild(span);
      this.themeOptionsEl.appendChild(label);
    });
    this.syncSelectAllCheckbox();
  }

  syncSelectAllCheckbox(){
    if(!this.selectAllEl || !this.themeOptionsEl) return;
    const checkboxes = Array.from(this.themeOptionsEl.querySelectorAll('input[type="checkbox"]'));
    if(checkboxes.length===0){
      this.selectAllEl.checked = false;
      return;
    }
    const allChecked = checkboxes.every(cb=>cb.checked);
    const noneChecked = checkboxes.every(cb=>!cb.checked);
    this.selectAllEl.checked = allChecked;
    if(this.themeErrorEl && !noneChecked){
      this.themeErrorEl.textContent='';
    }
  }

  bindThemeSelectorEvents(){
    if(this.openThemeSelectorBtn){
      this.openThemeSelectorBtn.addEventListener('click', ()=> this.showThemeSelector());
    }
    if(this.applyThemeSelectionBtn){
      this.applyThemeSelectionBtn.addEventListener('click', ()=>{
        const selected = this.getSelectedThemes();
        if(selected.length===0){
          if(this.themeErrorEl){ this.themeErrorEl.textContent='Sélectionnez au moins une thématique pour commencer.'; }
          return;
        }
        this.applyThemeSelection(selected);
        this.hideThemeSelector();
      });
    }
    if(this.closeThemeSelectorBtn){
      this.closeThemeSelectorBtn.addEventListener('click', ()=> this.hideThemeSelector());
    }
    if(this.selectAllEl){
      this.selectAllEl.addEventListener('change', (event)=>{
        const checked = event.target.checked;
        if(!this.themeOptionsEl) return;
        this.themeOptionsEl.querySelectorAll('input[type="checkbox"]').forEach(cb=>{ cb.checked = checked; });
        this.syncSelectAllCheckbox();
      });
    }
    if(this.themeOptionsEl){
      this.themeOptionsEl.addEventListener('change', ()=> this.syncSelectAllCheckbox());
    }
    if(this.themeModalEl){
      this.themeModalEl.addEventListener('click', event=>{
        if(event.target===this.themeModalEl){ this.hideThemeSelector(); }
      });
    }
  }

  getSelectedThemes(){
    if(!this.themeOptionsEl) return [];
    return Array.from(this.themeOptionsEl.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>cb.value);
  }

  applyThemeSelection(selectedCategories){
    this.activeCategories = new Set(selectedCategories);
    this.recomputeActiveCards();
    this.availableCards = [...this.cards];
    this.usedCards = [];
    this.updateCounter();
    this.prepareWelcomeCard();
    this.populateThemeOptions();
    const remainingMessage = this.formatRemainingCardsMessage(this.availableCards.length);
    this.updateStatus(`Thématiques mises à jour (${selectedCategories.length}). ${remainingMessage}.`);
  }

  setExpertButtonState(enabled){
    if(!this.expertAdviceBtn) return;
    this.expertAdviceBtn.disabled = !enabled;
    this.expertAdviceBtn.setAttribute('aria-disabled', String(!enabled));
  }

  clearExpertAdvicePanel(){
    if(this.expertAdviceCategoryEl){ this.expertAdviceCategoryEl.textContent=''; }
    if(this.expertAdviceVariationEl){ this.expertAdviceVariationEl.textContent=''; }
    if(this.expertAdviceSituationEl){ this.expertAdviceSituationEl.textContent=''; }
    if(this.expertAdviceContentEl){ this.expertAdviceContentEl.innerHTML=''; }
    if(this.masteryStatusEl){ this.masteryStatusEl.textContent=''; }
    if(this.masteryActionButtons){
      this.masteryActionButtons.forEach(button=>{
        button.classList.remove('active');
        button.setAttribute('aria-pressed','false');
      });
    }
    if(this.favoriteToggleBtn){
      this.favoriteToggleBtn.classList.remove('is-favorite','favorite-heart-animate');
      this.favoriteToggleBtn.setAttribute('aria-pressed','false');
      this.favoriteToggleBtn.setAttribute('aria-label','Ajouter cette recommandation aux favoris');
      const heartIcon = this.favoriteToggleBtn.querySelector('.heart-icon');
      if(heartIcon){ heartIcon.textContent = '♡'; }
    }
    if(this.favoriteAnimationTimeout){
      clearTimeout(this.favoriteAnimationTimeout);
      this.favoriteAnimationTimeout = null;
    }
    if(this.favoriteStatusEl){
      this.favoriteStatusEl.textContent='';
    }
  }

  bindExpertAdviceEvents(){
    if(this.expertAdviceBtn){
      this.expertAdviceBtn.addEventListener('click', ()=>{
        if(!this.expertAdviceBtn.disabled){ this.showExpertAdvice(); }
      });
    }
    if(this.closeExpertAdviceBtn){
      this.closeExpertAdviceBtn.addEventListener('click', ()=> this.hideExpertAdvice());
    }
    if(this.expertAdviceModalEl){
      this.expertAdviceModalEl.addEventListener('click', event=>{
        if(event.target===this.expertAdviceModalEl){ this.hideExpertAdvice(); }
      });
    }
    if(this.favoriteToggleBtn){
      this.favoriteToggleBtn.addEventListener('click', ()=>{
        const targetCard = this.activeExpertCard || this.currentCard;
        if(targetCard){
          this.toggleFavoriteForCard(targetCard);
        }
      });
    }
  }

  bindMasteryEvents(){
    if(!this.masteryActionButtons || this.masteryActionButtons.length===0) return;
    this.masteryActionButtons.forEach(button=>{
      button.addEventListener('click', ()=>{
        const mastered = button.dataset.mastered === 'true';
        this.handleMasteryToggle(mastered);
      });
    });
  }

  showExpertAdvice(cardOverride=null){
    const cardToShow = cardOverride || this.currentCard;
    if(!cardToShow || !cardToShow.advice || !this.expertAdviceModalEl) return;
    this.expertTriggerElement = document.activeElement;
    this.activeExpertCard = cardToShow;
    this.populateExpertAdviceContent(cardToShow);
    this.expertAdviceModalEl.classList.add('visible');
    this.expertAdviceModalEl.setAttribute('aria-hidden','false');
    this.scrollExpertAdviceToTop();
    this.updateMasteryControls(cardToShow);
    this.updateFavoriteButtonState(cardToShow);
    if(this.closeExpertAdviceBtn){ this.closeExpertAdviceBtn.focus(); }
  }

  hideExpertAdvice(){
    if(this.expertAdviceModalEl){
      this.expertAdviceModalEl.classList.remove('visible');
      this.expertAdviceModalEl.setAttribute('aria-hidden','true');
    }
    this.activeExpertCard = null;
    if(this.expertTriggerElement){
      this.expertTriggerElement.focus();
      this.expertTriggerElement = null;
    }else if(this.expertAdviceBtn){
      this.expertAdviceBtn.focus();
    }
  }

  populateExpertAdviceContent(card){
    if(!this.expertAdviceCategoryEl || !this.expertAdviceSituationEl || !this.expertAdviceContentEl) return;
    this.expertAdviceCategoryEl.textContent = card.category;
    if(this.expertAdviceVariationEl){
      if(card.type==='variation'){
        this.expertAdviceVariationEl.textContent = card.variationLabel || 'Variante';
      }else{
        this.expertAdviceVariationEl.textContent = '';
      }
    }
    this.expertAdviceSituationEl.textContent = card.content;
    this.expertAdviceContentEl.innerHTML='';
    const paragraphs = card.advice.split(/\n\s*\n/).map(text=>text.trim()).filter(text=>text.length>0);
    if(paragraphs.length===0){
      const fallback = document.createElement('p');
      fallback.textContent = card.advice.trim();
      this.expertAdviceContentEl.appendChild(fallback);
      return;
    }
    paragraphs.forEach(text=>{
      const p = document.createElement('p');
      p.textContent = text;
      this.expertAdviceContentEl.appendChild(p);
    });
  }

  scrollExpertAdviceToTop(){
    if(this.expertAdviceModalEl){
      if(typeof this.expertAdviceModalEl.scrollTo === 'function'){
        this.expertAdviceModalEl.scrollTo({ top:0, behavior:'smooth' });
      }else{
        this.expertAdviceModalEl.scrollTop = 0;
      }
      const modalContent = this.expertAdviceModalEl.querySelector('.modal-content');
      if(modalContent){
        modalContent.scrollTop = 0;
      }
    }
    if(this.expertAdviceContentEl){
      this.expertAdviceContentEl.scrollTop = 0;
    }
  }

  handleMasteryToggle(mastered){
    const targetCard = this.activeExpertCard || this.currentCard;
    if(!targetCard || targetCard===this.welcomeCard) return;
    const baseId = this.getBaseCardId(targetCard);
    const wasMastered = this.masteredPrinciples.has(baseId);
    if(mastered){
      if(!wasMastered){
        this.masteredPrinciples.add(baseId);
        this.refreshDeckAfterMasteryChange();
        const removedCount = this.getVariationCount(baseId);
        if(removedCount>0){
          const message = removedCount===1
            ? 'Principe marqué comme maîtrisé : la variante associée a été retirée du paquet.'
            : `Principe marqué comme maîtrisé : ${removedCount} variantes associées ont été retirées du paquet.`;
          this.updateStatus(message);
        }else{
          this.updateStatus('Principe marqué comme maîtrisé.');
        }
      }
    }else if(wasMastered){
      this.masteredPrinciples.delete(baseId);
      this.refreshDeckAfterMasteryChange();
      const readded = this.getVariationCount(baseId);
      if(readded>0){
        const message = readded===1
          ? 'Principe marqué à retravailler : la variante associée a été réintégrée dans le paquet.'
          : `Principe marqué à retravailler : ${readded} variantes associées ont été réintégrées dans le paquet.`;
        this.updateStatus(message);
      }else{
        this.updateStatus('Principe marqué à retravailler.');
      }
    }
    this.updateMasteryControls(targetCard);
  }

  getBaseCardId(card){
    if(card && card.type==='variation' && typeof card.variationOf==='number'){
      return card.variationOf;
    }
    return card ? card.id : null;
  }

  getVariationCount(baseId){
    const ids = this.variationMap ? this.variationMap.get(baseId) : null;
    return ids ? ids.length : 0;
  }

  updateMasteryControls(card){
    if(!card || card===this.welcomeCard) return;
    const baseId = this.getBaseCardId(card);
    const isMastered = this.masteredPrinciples.has(baseId);
    if(this.masteryActionButtons){
      this.masteryActionButtons.forEach(button=>{
        const buttonMastered = button.dataset.mastered === 'true';
        const isActive = buttonMastered === isMastered;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    }
    if(this.masteryStatusEl){
      const variationCount = this.getVariationCount(baseId);
      if(isMastered){
        if(variationCount>0){
          this.masteryStatusEl.textContent = variationCount===1
            ? 'Vous avez indiqué maîtriser ce principe : la variante associée a été retirée du paquet.'
            : `Vous avez indiqué maîtriser ce principe : les ${variationCount} variantes associées ont été retirées du paquet.`;
        }else{
          this.masteryStatusEl.textContent = 'Vous avez indiqué maîtriser ce principe.';
        }
      }else if(variationCount>0){
        this.masteryStatusEl.textContent = variationCount===1
          ? 'La variante associée reste disponible pour vous entraîner.'
          : `Les ${variationCount} variantes associées restent disponibles pour vous entraîner.`;
      }else{
        this.masteryStatusEl.textContent = 'Aucune variante supplémentaire n’est liée à cette carte pour le moment.';
      }
    }
  }

  showThemeSelector(){
    if(this.themeModalEl){
      if(this.advancedMenuWrapper && this.advancedMenuWrapper.classList.contains('open')){
        this.themeTriggerElement = this.advancedMenuToggle;
      }else{
        this.themeTriggerElement = document.activeElement;
      }
      this.populateThemeOptions();
      if(this.themeErrorEl){ this.themeErrorEl.textContent=''; }
      this.themeModalEl.classList.add('visible');
      this.themeModalEl.setAttribute('aria-hidden','false');
      const firstCheckbox = this.themeModalEl.querySelector('input[type="checkbox"]');
      if(firstCheckbox){
        firstCheckbox.focus();
      }else if(this.applyThemeSelectionBtn){
        this.applyThemeSelectionBtn.focus();
      }
    }
  }

  hideThemeSelector(){
    if(this.themeModalEl){
      this.themeModalEl.classList.remove('visible');
      this.themeModalEl.setAttribute('aria-hidden','true');
    }
    if(this.themeErrorEl){ this.themeErrorEl.textContent=''; }
    if(this.themeTriggerElement){
      this.themeTriggerElement.focus();
      this.themeTriggerElement = null;
    }else if(this.openThemeSelectorBtn){
      this.openThemeSelectorBtn.focus();
    }
  }

  bindAccessibilityInteractions(){
    if(this.deckEl){
      this.deckEl.addEventListener('keydown', this.handleDeckKeyPress);
    }
    if(this.cardEl){
      this.cardEl.addEventListener('keydown', this.handleCardKeyPress);
      this.updateCardFlipState(false);
    }
    document.addEventListener('keydown', this.handleGlobalKeyPress);
  }

  bindFavoritesEvents(){
    if(this.openFavoritesBtn){
      this.openFavoritesBtn.addEventListener('click', ()=> this.showFavoritesModal());
    }
    if(this.favoritesModalEl){
      this.favoritesModalEl.addEventListener('click', event=>{
        if(event.target===this.favoritesModalEl){
          this.hideFavoritesModal();
        }
      });
    }
    if(this.closeFavoritesBtns && this.closeFavoritesBtns.length>0){
      this.closeFavoritesBtns.forEach(button=>{
        button.addEventListener('click', ()=> this.hideFavoritesModal());
      });
    }
    if(this.favoritesListEl){
      this.favoritesListEl.addEventListener('click', event=>{
        const target = event.target;
        if(!(target instanceof HTMLElement)) return;
        const wrapper = target.closest('[data-favorite-id]');
        if(!wrapper) return;
        const id = Number(wrapper.dataset.favoriteId);
        if(Number.isNaN(id)) return;
        if(target.matches('.favorite-remove')){
          this.removeFavorite(id);
        }else if(target.matches('.favorite-open')){
          const card = this.getCardById(id, true);
          if(card){
            this.hideFavoritesModal(false);
            if(this.openFavoritesBtn){
              this.openFavoritesBtn.focus();
            }
            this.showExpertAdvice(card);
          }
        }
      });
    }
  }

  showFavoritesModal(){
    if(!this.favoritesModalEl) return;
    this.favoritesTriggerElement = document.activeElement;
    this.refreshFavoritesList();
    this.favoritesModalEl.classList.add('visible');
    this.favoritesModalEl.setAttribute('aria-hidden','false');
    const firstInteractive = this.favoritesModalEl.querySelector('.favorite-open, .favorite-remove, .modal-close, .btn');
    if(firstInteractive instanceof HTMLElement){
      firstInteractive.focus();
    }
  }

  hideFavoritesModal(restoreFocus=true){
    if(this.favoritesModalEl){
      this.favoritesModalEl.classList.remove('visible');
      this.favoritesModalEl.setAttribute('aria-hidden','true');
    }
    if(restoreFocus && this.favoritesTriggerElement instanceof HTMLElement){
      this.favoritesTriggerElement.focus();
    }else if(restoreFocus && this.openFavoritesBtn){
      this.openFavoritesBtn.focus();
    }
    this.favoritesTriggerElement = null;
  }

  toggleFavoriteForCard(card){
    const id = card.id;
    if(this.favoriteAdviceIds.has(id)){
      this.favoriteAdviceIds.delete(id);
      this.updateStatus('Recommandation retirée de vos favoris.');
    }else{
      this.favoriteAdviceIds.add(id);
      this.updateStatus('Recommandation enregistrée dans vos favoris 💖.');
    }
    this.updateFavoriteButtonState(card);
    this.animateFavoriteHeart();
    this.refreshFavoritesList();
  }

  removeFavorite(id){
    if(!this.favoriteAdviceIds.has(id)) return;
    this.favoriteAdviceIds.delete(id);
    const card = this.getCardById(id, true);
    if(card && (this.activeExpertCard && this.activeExpertCard.id===id)){
      this.updateFavoriteButtonState(card);
      this.animateFavoriteHeart();
    }
    this.refreshFavoritesList();
    this.updateStatus('Recommandation retirée de vos favoris.');
  }

  updateFavoriteButtonState(card){
    if(!this.favoriteToggleBtn) return;
    const isFavorite = this.isCardFavorite(card);
    this.favoriteToggleBtn.classList.toggle('is-favorite', isFavorite);
    this.favoriteToggleBtn.setAttribute('aria-pressed', String(isFavorite));
    this.favoriteToggleBtn.setAttribute('aria-label', isFavorite
      ? 'Retirer cette recommandation des favoris'
      : 'Ajouter cette recommandation aux favoris'
    );
    const heartIcon = this.favoriteToggleBtn.querySelector('.heart-icon');
    if(heartIcon){
      heartIcon.textContent = isFavorite ? '❤' : '♡';
    }
    if(this.favoriteStatusEl){
      this.favoriteStatusEl.textContent = isFavorite ? 'Ajoutée à vos favoris 💖' : '';
    }
  }

  animateFavoriteHeart(){
    if(!this.favoriteToggleBtn) return;
    this.favoriteToggleBtn.classList.remove('favorite-heart-animate');
    void this.favoriteToggleBtn.offsetWidth;
    this.favoriteToggleBtn.classList.add('favorite-heart-animate');
    if(this.favoriteAnimationTimeout){
      clearTimeout(this.favoriteAnimationTimeout);
    }
    this.favoriteAnimationTimeout = setTimeout(()=>{
      if(this.favoriteToggleBtn){
        this.favoriteToggleBtn.classList.remove('favorite-heart-animate');
      }
      this.favoriteAnimationTimeout = null;
    }, 600);
  }

  isCardFavorite(card){
    if(!card) return false;
    return this.favoriteAdviceIds.has(card.id);
  }

  refreshFavoritesList(){
    if(!this.favoritesListEl) return;
    this.favoritesListEl.innerHTML = '';
    if(this.favoriteAdviceIds.size===0){
      const empty = document.createElement('p');
      empty.className = 'favorites-empty';
      empty.textContent = 'Aucune recommandation enregistrée pour le moment.';
      this.favoritesListEl.appendChild(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    this.favoriteAdviceIds.forEach(id=>{
      const card = this.getCardById(id, true);
      if(!card) return;
      const item = document.createElement('article');
      item.className = 'favorite-item';
      item.dataset.favoriteId = String(id);
      item.setAttribute('role','listitem');

      const title = document.createElement('h3');
      title.className = 'favorite-title';
      const variationLabel = card.type==='variation' ? card.variationLabel : null;
      title.textContent = variationLabel ? `${card.category} · ${variationLabel}` : card.category;

      const excerpt = document.createElement('p');
      excerpt.className = 'favorite-excerpt';
      excerpt.textContent = card.content;

      const actions = document.createElement('div');
      actions.className = 'favorite-actions';

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'btn btn-secondary favorite-open';
      openBtn.textContent = 'Afficher la recommandation';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn favorite-remove';
      removeBtn.textContent = 'Retirer';

      actions.appendChild(openBtn);
      actions.appendChild(removeBtn);

      item.appendChild(title);
      item.appendChild(excerpt);
      item.appendChild(actions);

      fragment.appendChild(item);
    });
    this.favoritesListEl.appendChild(fragment);
  }

  getCardById(id, includeAll=false){
    const source = includeAll ? this.allCards : this.cards;
    return source.find(card=>card.id===id) || null;
  }

  exportSessionState(){
    try{
      const state = this.serializeSessionState();
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0];
      const filename = `session-discussion-${timestamp}.json`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      const remainingMessage = this.formatRemainingCardsMessage(this.availableCards.length);
      this.updateStatus(`Session enregistrée (${remainingMessage}).`);
    }catch(error){
      console.error('Erreur lors de la sauvegarde de la session :', error);
      this.updateStatus('Impossible d\'enregistrer la session.');
    }
  }

  serializeSessionState(){
    return {
      version: this.persistenceVersion,
      timestamp: new Date().toISOString(),
      activeCategories: Array.from(this.activeCategories),
      availableCardIds: this.availableCards.map(card=>card.id),
      usedCardIds: this.usedCards.map(card=>card.id),
      masteredPrinciples: Array.from(this.masteredPrinciples),
      favoriteCardIds: Array.from(this.favoriteAdviceIds)
    };
  }

  importSessionState(file){
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(reader.result);
        this.applySessionState(data);
        const remainingMessage = this.formatRemainingCardsMessage(this.availableCards.length);
        this.updateStatus(`Session chargée avec succès (${remainingMessage}).`);
      }catch(error){
        console.error('Erreur lors du chargement de la session :', error);
        this.updateStatus('Le fichier de session est invalide.');
      }
    };
    reader.onerror = ()=>{
      console.error('Erreur de lecture du fichier de session :', reader.error);
      this.updateStatus('Impossible de lire le fichier de session.');
    };
    reader.readAsText(file, 'utf-8');
  }

  applySessionState(data){
    const state = this.validateSessionData(data);
    const activeCategories = state.activeCategories && state.activeCategories.length>0
      ? state.activeCategories
      : this.getAllCategories();
    this.activeCategories = new Set(activeCategories);
    this.masteredPrinciples = new Set(state.masteredPrinciples || []);
    this.recomputeActiveCards();
    const availableIds = new Set(state.availableCardIds || []);
    const usedIds = new Set(state.usedCardIds || []);
    const availableCards = this.mapIdsToCards(availableIds);
    const usedCards = this.mapIdsToCards(usedIds);
    const knownIds = new Set([...availableCards, ...usedCards].map(card=>card.id));
    const missingCards = this.cards.filter(card=>!knownIds.has(card.id));
    this.availableCards = [...availableCards, ...missingCards];
    this.usedCards = usedCards;
    const favoriteIds = new Set(state.favoriteCardIds || []);
    const validFavorites = new Set();
    favoriteIds.forEach(id=>{
      if(this.getCardById(id, true)){ validFavorites.add(id); }
    });
    this.favoriteAdviceIds = validFavorites;
    this.populateThemeOptions();
    this.syncSelectAllCheckbox();
    this.updateCounter();
    this.prepareWelcomeCard();
    this.hideExpertAdvice();
    this.setExpertButtonState(false);
    this.refreshFavoritesList();
  }

  validateSessionData(data){
    if(!data || typeof data!=='object'){
      throw new Error('Structure JSON invalide.');
    }
    if(data.version && data.version>this.persistenceVersion){
      throw new Error('Version de fichier non prise en charge.');
    }
    const validateIdArray = (value)=>{
      if(!Array.isArray(value)) return [];
      return value.reduce((acc,id)=>{
        const numericId = Number(id);
        if(Number.isInteger(numericId)){
          acc.push(numericId);
        }
        return acc;
      },[]);
    };
    const activeCategories = Array.isArray(data.activeCategories)
      ? data.activeCategories.filter(cat=>typeof cat==='string')
      : [];
    return {
      activeCategories,
      availableCardIds: validateIdArray(data.availableCardIds),
      usedCardIds: validateIdArray(data.usedCardIds),
      masteredPrinciples: validateIdArray(data.masteredPrinciples),
      favoriteCardIds: validateIdArray(data.favoriteCardIds)
    };
  }

  mapIdsToCards(idSet){
    if(!idSet || idSet.size===0) return [];
    const mapped = [];
    idSet.forEach(id=>{
      const card = this.cards.find(item=>item.id===id);
      if(card){
        mapped.push(card);
      }
    });
    return mapped;
  }

  handleDeckKeyPress(event){
    if(!this.deckEl) return;
    if(event.key==='Enter' || event.key===' '){
      event.preventDefault();
      this.drawCard();
    }
  }

  handleCardKeyPress(event){
    if(!this.cardEl) return;
    if(event.key==='Enter' || event.key===' '){
      event.preventDefault();
      if(this.currentCard===this.welcomeCard && !this.cardEl.classList.contains('flipping')){
        this.drawCard();
        return;
      }
      if(this.currentCard && this.currentCard!==this.welcomeCard){
        if(this.cardEl.classList.contains('flipping')){
          this.cardEl.classList.remove('flipping');
          this.updateCardFlipState(false);
        }else{
          this.cardEl.classList.add('flipping');
          this.updateCardFlipState(true);
        }
      }
    }
  }

  handleGlobalKeyPress(event){
    if(event.key==='Escape'){
      if(this.themeModalEl && this.themeModalEl.classList.contains('visible')){
        this.hideThemeSelector();
      }else if(this.expertAdviceModalEl && this.expertAdviceModalEl.classList.contains('visible')){
        this.hideExpertAdvice();
      }else if(this.favoritesModalEl && this.favoritesModalEl.classList.contains('visible')){
        this.hideFavoritesModal();
      }
    }
  }

  updateCardFlipState(isFlipped){
    if(this.cardEl){
      this.cardEl.setAttribute('aria-pressed', String(Boolean(isFlipped)));
    }
  }

  updateStatus(message){
    if(this.cardStatusEl){
      this.cardStatusEl.textContent = message;
    }
  }

  formatRemainingCardsMessage(count){
    if(count===0){
      return 'aucune carte restante';
    }
    const label = count>1 ? 'cartes restantes' : 'carte restante';
    return `${count} ${label}`;
  }
}

let game;
function drawCard(){ if(game) game.drawCard(); }
function resetDeck(){ if(game) game.resetDeck(); }

window.addEventListener('load', ()=>{
  game = new DiscussionCardGame();
  game.cardContainerEl.classList.add('visible');
  game.cardEl.addEventListener('click', ()=>{
    if(game.currentCard===game.welcomeCard && !game.cardEl.classList.contains('flipping')){
      game.drawCard();
    }else if(game.currentCard && game.currentCard!==game.welcomeCard){
      if(game.cardEl.classList.contains('flipping')){
        game.cardEl.classList.remove('flipping');
        game.updateCardFlipState(false);
      }else{
        game.cardEl.classList.add('flipping');
        game.updateCardFlipState(true);
      }
    }
  });
  game.showThemeSelector();
});
