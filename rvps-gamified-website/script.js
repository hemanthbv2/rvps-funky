/* ═══════════════════════════════════════════════════════
   RVPS SCHOOL — GAMIFIED LANDING PAGE
   All interactive functionality
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  // ─── DOM REFS ───────────────────────
  var loader        = document.getElementById('loader');
  var nav           = document.getElementById('main-nav');
  var hamburger     = document.getElementById('hamburger');
  var mobileMenu    = document.getElementById('mobile-menu');
  var badgeContainer = document.getElementById('badge-container');
  var progressFill  = document.getElementById('progress-fill');
  var progressCount = document.getElementById('progress-count');
  var mascotReturn  = document.getElementById('mascot-return');
  var returnBtns    = document.getElementById('return-buttons');
  var finalUnlock   = document.getElementById('final-unlock');
  var canvas        = document.getElementById('particles-canvas');

  // ─── STATE ──────────────────────────
  var visited = {};
  var visitedCount = 0;
  var shownBadges = {};
  var TOTAL = 4;

  var SECTIONS = {
    campus:     { icon: '🏫', text: 'Explore the Campus' },
    activities: { icon: '📚', text: 'Classroom Activities & Courses' },
    learning:   { icon: '🧠', text: 'How Students Learn at RVPS' },
    principal:  { icon: '🎤', text: 'What the Principal has to say' }
  };

  var BADGES = {
    campus:     { icon: '🏫', title: 'Campus Explorer',   desc: 'You discovered the environment!' },
    activities: { icon: '📚', title: 'Curriculum Master',  desc: 'You unlocked the learning map!' },
    learning:   { icon: '🧠', title: 'Learning Detective', desc: 'You found out how we teach!' },
    principal:  { icon: '🎤', title: "Principal's Pick",   desc: 'You heard from the head!' }
  };

  // ═══════════════════════════════════════
  //  PARTICLES CANVAS (REMOVED FOR LIGHTWEIGHT VERSION)
  // ═══════════════════════════════════════

  // ═══════════════════════════════════════
  //  ROBOT ASSEMBLY
  // ═══════════════════════════════════════
  function assembleRobot() {
    var parts = document.querySelectorAll('.robot-part');
    var delays = [300, 500, 700, 900, 900, 1100];
    for (var i = 0; i < parts.length; i++) {
      (function(part, delay) {
        setTimeout(function() { part.classList.add('assembled'); }, delay);
      })(parts[i], delays[i] || (300 + i * 200));
    }
    // After assembly: idle float + speech bubble
    setTimeout(function() {
      var stage = document.querySelector('.robot-stage');
      if (stage) stage.classList.add('idle');
      var bubble = document.querySelector('.speech-bubble');
      if (bubble) bubble.classList.add('visible');
    }, 1500);
  }

  // ═══════════════════════════════════════
  //  LOADER
  // ═══════════════════════════════════════
  setTimeout(function() {
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(function() { loader.remove(); assembleRobot(); }, 600);
    } else { assembleRobot(); }
  }, 2200);

  // ═══════════════════════════════════════
  //  NAV SCROLL
  // ═══════════════════════════════════════
  window.addEventListener('scroll', function() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ═══════════════════════════════════════
  //  HAMBURGER
  // ═══════════════════════════════════════
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !hamburger.contains(e.target))
        closeMobileMenu();
    });
  }
  function closeMobileMenu() {
    if (hamburger) hamburger.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
  }
  window.closeMobileMenu = closeMobileMenu;

  // ═══════════════════════════════════════
  //  EXPLORE BUTTONS
  // ═══════════════════════════════════════
  var exploreBtns = document.querySelectorAll('.explore-btn');
  for (var i = 0; i < exploreBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var key = btn.getAttribute('data-key');
        if (key && !visited[key]) {
          openSection(key, btn);
        }
      });
    })(exploreBtns[i]);
  }

  // ═══════════════════════════════════════
  //  OPEN SECTION
  // ═══════════════════════════════════════
  function openSection(key, triggerBtn) {
    // Close open sections
    var openSections = document.querySelectorAll('.explore-section.open');
    for (var i = 0; i < openSections.length; i++) openSections[i].classList.remove('open');

    // Hide mascot return
    if (mascotReturn) mascotReturn.classList.remove('visible');

    // Mark button visited
    var allBtns = document.querySelectorAll('.explore-btn[data-key="'+key+'"]');
    for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.add('visited');

    // Track
    visited[key] = true;
    visitedCount++;
    updateProgress();
    popBadge(key);

    // Open section
    var section = document.getElementById('section-' + key);
    if (!section) return;

    setTimeout(function() {
      section.classList.add('open');
      setTimeout(function() {
        var navH = nav ? nav.offsetHeight : 70;
        var top = getOffsetTop(section) - navH - 10;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 100);

      // Reveal animations inside section
      setTimeout(function() {
        var revEls = section.querySelectorAll('.reveal');
        for (var i = 0; i < revEls.length; i++) {
          (function(el) {
            var obs = new IntersectionObserver(function(entries, observer) {
              for (var j = 0; j < entries.length; j++) {
                if (entries[j].isIntersecting) {
                  entries[j].target.classList.add('in');
                  observer.unobserve(entries[j].target);
                }
              }
            }, { threshold: 0.08 });
            obs.observe(el);
          })(revEls[i]);
        }
      }, 300);

      // Watch section end -> show mascot return
      setupEndWatcher(section);
    }, 80);
  }

  function setupEndWatcher(section) {
    var lastChild = section.querySelector('.section-inner > *:last-child') || section;
    var obs = new IntersectionObserver(function(entries, observer) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          showMascotReturn();
          observer.disconnect();
        }
      }
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });
    obs.observe(lastChild);
  }

  // ═══════════════════════════════════════
  //  MASCOT RETURN / FINAL UNLOCK
  // ═══════════════════════════════════════
  function showMascotReturn() {
    var remaining = [];
    var keys = ['campus','activities','learning','principal'];
    for (var i = 0; i < keys.length; i++) {
      if (!visited[keys[i]]) remaining.push(keys[i]);
    }

    if (remaining.length === 0) {
      if (finalUnlock) {
        finalUnlock.classList.add('visible');
        setTimeout(function() {
          window.scrollTo({ top: getOffsetTop(finalUnlock) - 80, behavior: 'smooth' });
        }, 100);
        setTimeout(launchConfetti, 400);
      }
    } else {
      if (returnBtns) {
        returnBtns.innerHTML = '';
        for (var i = 0; i < remaining.length; i++) {
          (function(k) {
            var b = document.createElement('button');
            b.className = 'explore-btn';
            b.setAttribute('data-key', k);
            b.innerHTML = '<span class="btn-icon">'+SECTIONS[k].icon+'</span><span class="btn-text">'+SECTIONS[k].text+'</span>';
            b.addEventListener('click', function(e) {
              e.preventDefault();
              openSection(k, b);
            });
            returnBtns.appendChild(b);
          })(remaining[i]);
        }
      }
      if (mascotReturn) {
        mascotReturn.classList.add('visible');
        setTimeout(function() {
          window.scrollTo({ top: getOffsetTop(mascotReturn) - 100, behavior: 'smooth' });
        }, 100);
      }
    }
  }

  // ═══════════════════════════════════════
  //  PROGRESS
  // ═══════════════════════════════════════
  function updateProgress() {
    var pct = (visitedCount / TOTAL) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressCount) progressCount.textContent = visitedCount + ' / ' + TOTAL;
  }

  // ═══════════════════════════════════════
  //  BADGES
  // ═══════════════════════════════════════
  function popBadge(key) {
    if (shownBadges[key]) return;
    shownBadges[key] = true;
    var data = BADGES[key];
    if (!data || !badgeContainer) return;
    var badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.innerHTML = '<div class="badge-icon">'+data.icon+'</div><div class="badge-text"><h4>'+data.title+'</h4><p>'+data.desc+'</p></div>';
    badgeContainer.appendChild(badge);
    setTimeout(function(){ badge.classList.add('show'); }, 80);
    setTimeout(function(){ badge.classList.remove('show'); setTimeout(function(){ badge.remove(); }, 420); }, 4000);
  }

  // ═══════════════════════════════════════
  //  CONFETTI
  // ═══════════════════════════════════════
  function launchConfetti() {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9990;overflow:hidden;';
    document.body.appendChild(box);
    var colors = ['#F5C518','#00D4AA','#8B5CF6','#FF6B6B','#fff'];
    for (var i=0; i<72; i++) {
      var p = document.createElement('div');
      var s = Math.random()*8+3;
      p.style.cssText = 'position:absolute;top:-10px;left:'+Math.random()*100+'%;width:'+s+'px;height:'+(s*(Math.random()>.5?1:.5))+'px;background:'+colors[Math.floor(Math.random()*5)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';animation:confettiFall '+(Math.random()*2+2)+'s ease-in forwards;animation-delay:'+(Math.random()*.8)+'s;';
      box.appendChild(p);
    }
    setTimeout(function(){ box.remove(); }, 4500);
  }

  // ═══════════════════════════════════════
  //  GRADE TABS
  // ═══════════════════════════════════════
  var GC = {
    early:[{i:'🎮',t:'Play-Based Learning',d:'Structured play developing motor skills, social skills and early cognition.',b:'Pre-Nursery – KG'},{i:'🎨',t:'Sensory Activities',d:'Hands-on exploration with colors, textures, sounds and shapes.',b:'Pre-Nursery – KG'},{i:'📖',t:'Story & Language',d:'Storytelling, rhymes and early reading for language development.',b:'Pre-Nursery – KG'},{i:'🎵',t:'Music & Movement',d:'Rhythm, songs and dance developing coordination.',b:'Pre-Nursery – KG'},{i:'🌱',t:'Nature Exploration',d:'Outdoor learning connecting children to the world.',b:'Pre-Nursery – KG'},{i:'🧮',t:'Early Numeracy',d:'Counting, patterns and math through games.',b:'Pre-Nursery – KG'}],
    primary:[{i:'🤖',t:'Robotics & Coding',d:'Build, program and test robots from Grade 3.',b:'From Grade 3'},{i:'💰',t:'Financial Literacy',d:'Real-world money skills — budgeting, saving, value.',b:'Grade 1–5'},{i:'🔄',t:'Barter Learning',d:'Students trade skills in structured barter activities.',b:'Grade 1+'},{i:'🎨',t:'Art-Integrated Learning',d:'History through murals, science through sculpture.',b:'Grade 1–5'},{i:'🎵',t:'Music & Performance',d:'Vocal, instrumental, dance and theater arts.',b:'Grade 1–5'},{i:'🏃',t:'Sports & Fitness',d:'Physical education, yoga and mindfulness.',b:'Grade 1–5'}],
    middle:[{i:'🤖',t:'Advanced Robotics',d:'Complex builds, sensor integration and programming.',b:'Grade 6–8'},{i:'🔬',t:'Science Labs',d:'Independent experiments across physics, chemistry, biology.',b:'Grade 6–8'},{i:'💻',t:'Digital Literacy',d:'Web development, data handling and digital citizenship.',b:'Grade 6–8'},{i:'📊',t:'Financial Projects',d:'Mini-business simulations and economic case studies.',b:'Grade 6–8'},{i:'🎨',t:'Creative Expression',d:'Advanced art and multimedia projects.',b:'Grade 6–8'},{i:'🌍',t:'Social Studies',d:'Research-driven projects on culture and current affairs.',b:'Grade 6–8'}],
    senior:[{i:'🧠',t:'AI & Machine Learning',d:'Intro to AI, data patterns and responsible tech.',b:'Grade 9–10'},{i:'📐',t:'Advanced Mathematics',d:'Problem-solving, modelling and competition prep.',b:'Grade 9–10'},{i:'🔬',t:'Research Projects',d:'Guided independent research with formal papers.',b:'Grade 9–10'},{i:'💼',t:'Career Exploration',d:'Industry visits, mentorship and career workshops.',b:'Grade 9–10'},{i:'🗣️',t:'Debate & Public Speaking',d:'Model UN, debate clubs and structured oratory.',b:'Grade 9–10'},{i:'🏆',t:'Leadership Programs',d:'Student council, peer tutoring, community service.',b:'Grade 9–10'}]
  };

  var gradeTabs = document.querySelectorAll('.grade-tab');
  for (var i = 0; i < gradeTabs.length; i++) {
    (function(tab) {
      tab.addEventListener('click', function() {
        for (var j = 0; j < gradeTabs.length; j++) gradeTabs[j].classList.remove('active');
        tab.classList.add('active');
        var grid = document.getElementById('activity-grid');
        var data = GC[tab.getAttribute('data-grade')];
        if (!grid || !data) return;
        grid.style.opacity = '0'; grid.style.transform = 'translateY(10px)';
        setTimeout(function() {
          grid.innerHTML = data.map(function(a) {
            return '<div class="activity-card"><div class="card-icon">'+a.i+'</div><h4>'+a.t+'</h4><p>'+a.d+'</p><span class="activity-badge">'+a.b+'</span></div>';
          }).join('');
          grid.style.transition = 'opacity .3s ease,transform .3s ease';
          grid.style.opacity = '1'; grid.style.transform = 'translateY(0)';
        }, 260);
      });
    })(gradeTabs[i]);
  }

  // ═══════════════════════════════════════
  //  STATS COUNTER
  // ═══════════════════════════════════════
  var statsStarted = false;
  var statsEl = document.getElementById('stats-section');
  if (statsEl) {
    var statsObs = new IntersectionObserver(function(entries, observer) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting && !statsStarted) {
          statsStarted = true;
          observer.unobserve(statsEl);
          var counters = document.querySelectorAll('.cnt');
          for (var j = 0; j < counters.length; j++) {
            (function(counter) {
              var target = parseInt(counter.getAttribute('data-t'));
              var n = 0, inc = target / 55;
              (function count() {
                n += inc;
                if (n < target) { counter.textContent = Math.ceil(n); requestAnimationFrame(count); }
                else counter.textContent = target;
              })();
            })(counters[j]);
          }
        }
      }
    }, { threshold: 0.5 });
    statsObs.observe(statsEl);
  }

  // ═══════════════════════════════════════
  //  FAQ
  // ═══════════════════════════════════════
  var faqItems = document.querySelectorAll('.fi');
  for (var i = 0; i < faqItems.length; i++) {
    (function(item) {
      var btn = item.querySelector('.fq');
      if (btn) {
        btn.addEventListener('click', function() {
          var wasOpen = item.classList.contains('on');
          for (var j = 0; j < faqItems.length; j++) faqItems[j].classList.remove('on');
          if (!wasOpen) item.classList.add('on');
        });
      }
    })(faqItems[i]);
  }

  // ═══════════════════════════════════════
  //  SCROLL REVEAL
  // ═══════════════════════════════════════
  var revealObs = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('in');
        revealObs.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.1 });
  var revEls = document.querySelectorAll('.reveal');
  for (var i = 0; i < revEls.length; i++) revealObs.observe(revEls[i]);

  // ═══════════════════════════════════════
  //  FORM
  // ═══════════════════════════════════════
  var fov = document.getElementById('fov');
  var fpanel = document.getElementById('fpanel');

  window.openForm = function() { if (fov) fov.classList.add('open'); };
  window.closeForm = function() { if (fov) fov.classList.remove('open'); };

  if (fov) {
    fov.addEventListener('click', function(e) { if (e.target === fov) window.closeForm(); });
  }
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.closeForm(); });

  window.submitForm = function(btn) {
    var fn = document.getElementById('fn'), fp = document.getElementById('fp'), fg = document.getElementById('fg');
    if (fn && !fn.value.trim()) { fn.style.borderColor = '#FF6B6B'; fn.focus(); return; }
    if (fp && !fp.value.trim()) { fp.style.borderColor = '#FF6B6B'; fp.focus(); return; }
    if (fg && !fg.value) { fg.style.borderColor = '#FF6B6B'; fg.focus(); return; }
    btn.textContent = 'Sending...'; btn.disabled = true;
    setTimeout(function() {
      var ok = document.getElementById('fok');
      if (ok) ok.style.display = 'block';
      btn.style.display = 'none';
      setTimeout(function() {
        window.closeForm();
        if (fn) fn.value = ''; if (fp) fp.value = ''; if (fg) fg.value = '';
        if (ok) ok.style.display = 'none';
        btn.style.display = 'block';
        btn.textContent = 'Get Details Instantly →';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  };

  // ═══════════════════════════════════════
  //  HELPER
  // ═══════════════════════════════════════
  function getOffsetTop(el) {
    var top = 0;
    while (el) { top += el.offsetTop; el = el.offsetParent; }
    return top;
  }

});
