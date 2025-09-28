class DiscussionCardGame {
  constructor(){
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
    this.expertAdviceBtn = document.getElementById('expertAdviceBtn');
    this.expertAdviceModalEl = document.getElementById('expertAdviceModal');
    this.expertAdviceCategoryEl = document.getElementById('expertAdviceCategory');
    this.expertAdviceSituationEl = document.getElementById('expertAdviceSituation');
    this.expertAdviceContentEl = document.getElementById('expertAdviceContent');
    this.closeExpertAdviceBtn = document.getElementById('closeExpertAdvice');
    this.activeCategories = new Set(this.cards.map(card=>card.category));
    this.updateCounter();
    this.createFloatingParticles();
    this.prepareWelcomeCard();
    this.populateThemeOptions();
    this.bindThemeSelectorEvents();
    this.bindExpertAdviceEvents();
    this.setExpertButtonState(false);
  }

  prepareWelcomeCard(){
    this.currentCard = this.welcomeCard;
    if(this.cardEl){ this.cardEl.classList.remove('flipping'); }
    if(this.cardCategoryEl){ this.cardCategoryEl.textContent = this.welcomeCard.category; }
    if(this.cardContentEl){ this.cardContentEl.textContent = this.welcomeCard.content; }
    this.hideExpertAdvice();
    this.clearExpertAdvicePanel();
    this.setExpertButtonState(false);
  }

  loadCardsFromXML(){
    const xmlData = document.getElementById('cardsData').textContent;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData,'text/xml');
    const nodes = xmlDoc.querySelectorAll('card');
    return Array.from(nodes).map(card=>{
      const contentNode = card.querySelector('content');
      const adviceNode = card.querySelector('advice');
      return {
        category: card.getAttribute('category'),
        content: contentNode ? contentNode.textContent.trim() : '',
        advice: adviceNode ? adviceNode.textContent.trim() : ''
      };
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
    setTimeout(()=> this.cardEl.classList.add('flipping'),100);
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
  }

  showNoMoreCards(){
    this.cardEl.classList.remove('flipping');
    setTimeout(()=>{
      this.cardCategoryEl.textContent='Fin du Jeu';
      this.cardContentEl.textContent='Toutes les cartes ont été piochées ! Cliquez sur "Réinitialiser" pour recommencer.';
      setTimeout(()=> this.cardEl.classList.add('flipping'),100);
    },400);
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
    this.populateExpertAdviceContent(this.currentCard);
    this.expertAdviceModalEl.classList.add('visible');
    this.expertAdviceModalEl.setAttribute('aria-hidden','false');
  }

  hideExpertAdvice(){
    if(this.expertAdviceModalEl){
      this.expertAdviceModalEl.classList.remove('visible');
      this.expertAdviceModalEl.setAttribute('aria-hidden','true');
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
      this.populateThemeOptions();
      if(this.themeErrorEl){ this.themeErrorEl.textContent=''; }
      this.themeModalEl.classList.add('visible');
    }
  }

  hideThemeSelector(){
    if(this.themeModalEl){
      this.themeModalEl.classList.remove('visible');
    }
    if(this.themeErrorEl){ this.themeErrorEl.textContent=''; }
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
      if(game.cardEl.classList.contains('flipping')){ game.cardEl.classList.remove('flipping'); }
      else{ game.cardEl.classList.add('flipping'); }
    }
  });
  game.showThemeSelector();
});
