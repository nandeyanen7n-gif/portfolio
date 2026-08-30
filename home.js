(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero logo: desktop existing / mobile yellow only ---------- */
  (function(){
    var hero = document.getElementById('hero');
    var blackPath = document.querySelector('#heroLogo .logo-line');
    var yellowPath = document.querySelector('#heroLogo .logo-line-under');
    if(!hero) return;

    if(reduceMotion || !blackPath || !yellowPath || typeof blackPath.getTotalLength !== 'function'){
      hero.classList.add('is-ready');
      document.body.classList.add('intro-complete');
      return;
    }

    var blackLen = blackPath.getTotalLength();
    var yellowLen = yellowPath.getTotalLength();
    var isMobile = window.matchMedia('(max-width:760px)').matches;

    if(isMobile){
      blackPath.style.transition = 'none';
      blackPath.style.strokeDasharray = 'none';
      blackPath.style.strokeDashoffset = '0';
      blackPath.style.opacity = '1';

      yellowPath.style.strokeDasharray = yellowLen;
      yellowPath.style.strokeDashoffset = -yellowLen;
      yellowPath.style.opacity = '0';

      hero.classList.add('is-ready');
      document.body.classList.add('intro-complete');

      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          yellowPath.style.transition = 'stroke-dashoffset 1750ms cubic-bezier(.22,1,.36,1), opacity 280ms ease';
          yellowPath.style.opacity = '0.95';
          yellowPath.style.strokeDashoffset = '0';
        });
      });

      window.setTimeout(function(){
        yellowPath.style.transition = 'opacity 520ms ease';
        yellowPath.style.opacity = '0';
      }, 1800);

      onScrollHeader();
      return;
    }

    var drawDuration = 2850;
    var chaseDelay = 550;
    blackPath.style.strokeDasharray = blackLen;
    blackPath.style.strokeDashoffset = -blackLen;
    yellowPath.style.strokeDasharray = yellowLen;
    yellowPath.style.strokeDashoffset = -yellowLen;
    yellowPath.style.opacity = '0';

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        blackPath.style.transition = 'stroke-dashoffset '+drawDuration+'ms cubic-bezier(.22,1,.36,1)';
        yellowPath.style.transition = 'stroke-dashoffset 1650ms cubic-bezier(.22,1,.36,1) '+chaseDelay+'ms, opacity 950ms ease';
        blackPath.style.strokeDashoffset = '0';
        yellowPath.style.opacity = '0.95';
        yellowPath.style.strokeDashoffset = '0';
      });
    });

    window.setTimeout(function(){
      yellowPath.style.opacity = '0';
      hero.classList.add('is-ready');
    }, drawDuration + chaseDelay + 80);
    window.setTimeout(function(){
      document.body.classList.add('intro-complete');
      onScrollHeader();
    }, drawDuration + chaseDelay + 820);
  })();

  /* ---------- header: scrolled state ---------- */
  var gnav = document.getElementById('gnav');
  function onScrollHeader(){
    gnav.classList.toggle('scrolled', window.scrollY > 12);
    document.body.classList.toggle('has-scrolled', window.scrollY > 10);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, {passive:true});

  /* v44 mobile header direction behavior */
  var lastMobileY = window.scrollY;
  window.addEventListener('scroll', function(){
    if(window.innerWidth > 760 || document.body.classList.contains('nav-open')){ gnav.classList.remove('mobile-hidden'); lastMobileY=window.scrollY; return; }
    var y=window.scrollY;
    if(y < 24 || y < lastMobileY - 6) gnav.classList.remove('mobile-hidden');
    else if(y > lastMobileY + 6 && y > 90) gnav.classList.add('mobile-hidden');
    lastMobileY=y;
  }, {passive:true});

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById('navBurger');
  var navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('nav-open', open);
  });
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-label','メニューを開く');
      document.body.classList.remove('nav-open');
    });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && navLinks.classList.contains('open')){
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-label','メニューを開く');
      document.body.classList.remove('nav-open');
      burger.focus();
    }
  });

  /* ---------- smooth scroll with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var headerH = document.getElementById('gnav').offsetHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
      window.scrollTo({top: top, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  });

  /* ---------- scroll-spy + sliding nav indicator ---------- */
  var navItems = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var indicator = document.getElementById('navIndicator');
  var sections = navItems.map(function(a){ return document.querySelector(a.getAttribute('href')); });

  function moveIndicator(link){
    if(!link || window.innerWidth <= 680) return;
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
  }

  function setActive(link){
    navItems.forEach(function(a){ a.classList.remove('active'); });
    if(link){ link.classList.add('active'); moveIndicator(link); }
  }

  var spyObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var idx = sections.indexOf(entry.target);
        if(idx > -1) setActive(navItems[idx]);
      }
    });
  }, {rootMargin: '-45% 0px -50% 0px'});
  sections.forEach(function(s){ if(s) spyObserver.observe(s); });

  window.addEventListener('resize', function(){
    var current = document.querySelector('[data-nav].active');
    moveIndicator(current);
    if(window.innerWidth > 760 && navLinks.classList.contains('open')){
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-label','メニューを開く');
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.16});
  document.querySelectorAll('.reveal').forEach(function(el){ revealObserver.observe(el); });

  /* ---------- page top ---------- */
  var pageTop = document.getElementById('pageTop');
  function updatePageTop(){
    pageTop.classList.toggle('is-visible', window.scrollY > Math.max(420, window.innerHeight * .65));
  }
  updatePageTop();
  window.addEventListener('scroll', updatePageTop, {passive:true});
  pageTop.addEventListener('click', function(){
    window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
  });


})();
