class DiscussionCardGame {
  constructor(){
    this.persistenceVersion = 1;
    this.allCards = this.loadCardsFromXML();
    this.cards = [...this.allCards];
    this.availableCards = [...this.cards];
    this.usedCards = [];
    this.currentCard = null;
    this.welcomeCard = {
      category:'Bienvenue',
      content:'Cliquez sur le tas de cartes pour découvrir votre première question de discussion !'
    };
    this.cardEl = document.getElementById('discussionCard');
    this.cardCategoryEl = document.getElementById('cardCategory');
    this.cardContentEl = document.getElementById('cardContent');
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
    this.expertAdviceSituationEl = document.getElementById('expertAdviceSituation');
    this.expertAdviceContentEl = document.getElementById('expertAdviceContent');
    this.closeExpertAdviceBtn = document.getElementById('closeExpertAdvice');
    this.saveSessionBtn = document.getElementById('saveSession');
    this.loadSessionBtn = document.getElementById('loadSession');
    this.sessionFileInput = document.getElementById('sessionFileInput');
    this.cardStatusEl = document.getElementById('cardStatus');
    this.themeTriggerElement = null;
    this.expertTriggerElement = null;
    this.handleDeckKeyPress = this.handleDeckKeyPress.bind(this);
    this.handleCardKeyPress = this.handleCardKeyPress.bind(this);
    this.handleGlobalKeyPress = this.handleGlobalKeyPress.bind(this);
    this.activeCategories = new Set(this.cards.map(card=>card.category));
    this.updateCounter();
    this.createFloatingParticles();
    this.prepareWelcomeCard();
    this.populateThemeOptions();
    this.bindThemeSelectorEvents();
    this.bindExpertAdviceEvents();
    this.bindPersistenceEvents();
    this.bindAccessibilityInteractions();
    this.setExpertButtonState(false);
  }

  prepareWelcomeCard(){
    this.currentCard = this.welcomeCard;
    if(this.cardEl){ this.cardEl.classList.remove('flipping'); }
    this.updateCardFlipState(false);
    if(this.cardCategoryEl){ this.cardCategoryEl.textContent = this.welcomeCard.category; }
    if(this.cardContentEl){ this.cardContentEl.textContent = this.welcomeCard.content; }
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
    return Array.from(nodes).map((card,index)=>{
      const contentNode = card.querySelector('content');
      const adviceNode = card.querySelector('advice');
      return {
        id: index,
        category: card.getAttribute('category'),
        content: contentNode ? contentNode.textContent.trim() : '',
        advice: adviceNode ? adviceNode.textContent.trim() : ''
      };
    });
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
    this.cardCategoryEl.textContent = card.category;
    this.cardContentEl.textContent = card.content;
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
    this.cards = this.allCards.filter(card=>this.activeCategories.has(card.category));
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
    if(this.expertAdviceSituationEl){ this.expertAdviceSituationEl.textContent=''; }
    if(this.expertAdviceContentEl){ this.expertAdviceContentEl.innerHTML=''; }
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
  }

  showExpertAdvice(){
    if(!this.currentCard || !this.currentCard.advice || !this.expertAdviceModalEl) return;
    this.expertTriggerElement = document.activeElement;
    this.populateExpertAdviceContent(this.currentCard);
    this.expertAdviceModalEl.classList.add('visible');
    this.expertAdviceModalEl.setAttribute('aria-hidden','false');
    if(this.closeExpertAdviceBtn){ this.closeExpertAdviceBtn.focus(); }
  }

  hideExpertAdvice(){
    if(this.expertAdviceModalEl){
      this.expertAdviceModalEl.classList.remove('visible');
      this.expertAdviceModalEl.setAttribute('aria-hidden','true');
    }
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

  showThemeSelector(){
    if(this.themeModalEl){
      this.themeTriggerElement = document.activeElement;
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
      usedCardIds: this.usedCards.map(card=>card.id)
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
    this.cards = this.allCards.filter(card=>this.activeCategories.has(card.category));
    const availableIds = new Set(state.availableCardIds || []);
    const usedIds = new Set(state.usedCardIds || []);
    const availableCards = this.mapIdsToCards(availableIds);
    const usedCards = this.mapIdsToCards(usedIds);
    const knownIds = new Set([...availableCards, ...usedCards].map(card=>card.id));
    const missingCards = this.cards.filter(card=>!knownIds.has(card.id));
    this.availableCards = [...availableCards, ...missingCards];
    this.usedCards = usedCards;
    this.populateThemeOptions();
    this.syncSelectAllCheckbox();
    this.updateCounter();
    this.prepareWelcomeCard();
    this.hideExpertAdvice();
    this.setExpertButtonState(false);
  }

  validateSessionData(data){
    if(!data || typeof data!=='object'){
      throw new Error('Structure JSON invalide.');
    }
    if(data.version && data.version!==this.persistenceVersion){
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
      usedCardIds: validateIdArray(data.usedCardIds)
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
