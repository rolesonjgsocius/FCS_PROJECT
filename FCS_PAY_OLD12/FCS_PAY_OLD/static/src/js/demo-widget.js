// document.addEventListener("DOMContentLoaded", function () {
//      function getQueryParam(name) {
//        const params = new URLSearchParams(window.location.search);
//        return params.get(name);
//      }
//
//      function getEffectiveColor(value) {
//        if (!value) return null;
//        if (!value.startsWith('#') && !/^#[0-9A-F]{6}$/i.test('#' + value)) {
//          const temp = document.createElement("div");
//          temp.style.color = value;
//          document.body.appendChild(temp);
//          const rgb = getComputedStyle(temp).color;
//          document.body.removeChild(temp);
//          const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
//          if (!match) return null;
//          const [_, r, g, b] = match;
//          return `#${(+r).toString(16).padStart(2, '0')}${(+g).toString(16).padStart(2, '0')}${(+b).toString(16).padStart(2, '0')}`;
//        }
//        return value.startsWith('#') ? value : `#${value}`;
//      }
//
//      function adjustLightness(hex, percent) {
//        const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16));
//        let [r, g, b] = rgb.map(x => x / 255);
//
//        const max = Math.max(r, g, b), min = Math.min(r, g, b);
//        let h, s, l = (max + min) / 2;
//
//        if (max === min) {
//          h = s = 0;
//        } else {
//          const d = max - min;
//          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//          switch (max) {
//            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//            case g: h = (b - r) / d + 2; break;
//            case b: h = (r - g) / d + 4; break;
//          }
//          h /= 6;
//        }
//
//        l = Math.min(1, Math.max(0, l + percent));
//
//        function hslToRgb(h, s, l) {
//          const hue2rgb = (p, q, t) => {
//            if (t < 0) t += 1;
//            if (t > 1) t -= 1;
//            if (t < 1/6) return p + (q - p) * 6 * t;
//            if (t < 1/2) return q;
//            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//            return p;
//          };
//
//          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//          const p = 2 * l - q;
//          const r = hue2rgb(p, q, h + 1/3);
//          const g = hue2rgb(p, q, h);
//          const b = hue2rgb(p, q, h - 1/3);
//          return [r, g, b].map(x => Math.round(x * 255));
//        }
//
//        const [rOut, gOut, bOut] = hslToRgb(h, s, l);
//        return `#${((1 << 24) + (rOut << 16) + (gOut << 8) + bOut).toString(16).slice(1)}`;
//      }
//
//      const referrer = document.referrer || 'unknown';
//      const src = getQueryParam('src') || 'no-location';
//      const listFilter = getQueryParam('listfilter') || 'all';
//      const showTitle = getQueryParam('title') !== 'no';
//      const borderOn = getQueryParam('border') !== 'no';
//      const backgroundColor = getQueryParam('background') || '#fff';
//      const rawButtonColor = getQueryParam('buttoncolor') || '007bff';
//      const buttonColor = getEffectiveColor(rawButtonColor);
//      const buttonHoverColor = adjustLightness(buttonColor, -0.15);
//      const buttonLoadingColor = adjustLightness(buttonColor, 0.1);
//
//      // New carousel parameters
//      const carouselParam = getQueryParam('carousel');
//      const useCarousel = carouselParam === 'yes';
//      const carouselOnly = carouselParam === 'only';
//      const hideCarousel = carouselParam === 'no';
//      const layoutMode = getQueryParam('layout') || 'vertical'; // 'vertical', 'horizontal', or 'auto'
//      const imageSize = getQueryParam('size') || 'small'; // 'small', 'medium', 'large', or 'full'
//
//      const demoSelect = document.getElementById('demoList');
//      const phoneInput = document.getElementById('phone');
//      const phoneError = document.getElementById('phoneError');
//      const submitBtn = document.getElementById('submitBtn');
//      const header = document.getElementById('widget-header');
//      const container = document.getElementById('widgetContainer');
//      const carouselContainer = document.getElementById('carouselContainer');
//      const demoSelector = document.getElementById('demoSelector');
//
//      // Setup carousel elements
//      const prevBtn = document.getElementById('prevBtn');
//      const nextBtn = document.getElementById('nextBtn');
//      const carouselDots = document.getElementById('carouselDots');
//
//      if (!showTitle && header) {
//        header.remove();
//      }
//
//      if (!borderOn) {
//        container.style.border = 'none';
//        container.style.boxShadow = 'none';
//      }
//
//      // Apply layout mode and size
//      if (layoutMode === 'horizontal') {
//        container.classList.add('horizontal');
//        carouselContainer.classList.add('horizontal');
//
//        // If carousel is explicitly disabled, add no-carousel class
//        if (hideCarousel) {
//          container.classList.add('no-carousel');
//        }
//      } else if (layoutMode === 'auto') {
//        container.classList.add('auto-responsive');
//        carouselContainer.classList.add('auto-responsive');
//
//        // If carousel is explicitly disabled, add no-carousel class
//        if (hideCarousel) {
//          container.classList.add('no-carousel');
//        }
//      }
//
//      // Apply image size
//      if (imageSize !== 'small') {
//        container.classList.add(imageSize);
//        carouselContainer.classList.add(imageSize);
//      }
//
//      // For full size, also adjust body to remove padding
//      if (imageSize === 'full') {
//        document.body.classList.add('full-width');
//      }
//
//      container.style.backgroundColor = backgroundColor;
//      submitBtn.style.backgroundColor = buttonColor;
//
//      const styleSheet = document.createElement("style");
//      styleSheet.innerText = `
//        .custom-button:hover {
//          background-color: ${buttonHoverColor} !important;
//        }
//        .custom-button.loading {
//          background-color: ${buttonLoadingColor} !important;
//        }
//      `;
//      document.head.appendChild(styleSheet);
//
//      // Carousel functionality
//      let currentSlide = 0;
//      let demos = [];
//      let carouselSlides = [];
//      let isUpdatingFromCarousel = false; // Prevent infinite loops
//
//      // Touch/swipe functionality
//      let touchStartX = 0;
//      let touchEndX = 0;
//      let isSwiping = false;
//
//      function showSlide(index) {
//        if (carouselSlides.length === 0) return;
//
//        carouselSlides.forEach((slide, i) => {
//          slide.classList.toggle('active', i === index);
//        });
//
//        // Dots removed to save space
//
//        currentSlide = index;
//
//        // Update demo selection (prevent infinite loops)
//        if (demos[index] && !isUpdatingFromCarousel) {
//          isUpdatingFromCarousel = true;
//          demoSelect.value = `${demos[index]['AVID']},${demos[index]['Trigger Id']}`;
//          setTimeout(() => { isUpdatingFromCarousel = false; }, 100);
//        }
//      }
//
//      function nextSlide() {
//        const nextIndex = (currentSlide + 1) % carouselSlides.length;
//        showSlide(nextIndex);
//      }
//
//      function prevSlide() {
//        const prevIndex = currentSlide === 0 ? carouselSlides.length - 1 : currentSlide - 1;
//        showSlide(prevIndex);
//      }
//
//      function createCarousel(demos) {
//        carouselContainer.innerHTML = '';
//        carouselSlides = [];
//
//        // Create navigation buttons
//        const prevBtn = document.createElement('button');
//        prevBtn.className = 'carousel-nav prev';
//        prevBtn.innerHTML = '‹';
//        prevBtn.onclick = prevSlide;
//        carouselContainer.appendChild(prevBtn);
//
//        const nextBtn = document.createElement('button');
//        nextBtn.className = 'carousel-nav next';
//        nextBtn.innerHTML = '›';
//        nextBtn.onclick = nextSlide;
//        carouselContainer.appendChild(nextBtn);
//
//        // Create dots container
//        const dotsContainer = document.createElement('div');
//        dotsContainer.className = 'carousel-dots';
//        carouselContainer.appendChild(dotsContainer);
//
//        // Add touch event listeners for swipe gestures
//        carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
//        carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
//        carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
//
//        // Create slides
//        demos.forEach((demo, index) => {
//          const slide = document.createElement('div');
//          let slideClass = 'carousel-slide';
//          if (layoutMode === 'horizontal') slideClass += ' horizontal';
//          if (layoutMode === 'auto') slideClass += ' auto-responsive';
//          slide.className = slideClass;
//
//          const image = document.createElement('img');
//          let imageClass = 'carousel-image';
//          if (layoutMode === 'horizontal') imageClass += ' horizontal';
//          if (layoutMode === 'auto') imageClass += ' auto-responsive';
//          if (imageSize !== 'small') imageClass += ` ${imageSize}`;
//          image.className = imageClass;
//
//          // For full size, ensure image scales properly
//          if (imageSize === 'full') {
//            image.style.objectFit = 'contain';
//            image.style.maxWidth = '120%';
//            image.style.height = 'auto';
//            image.style.width = 'auto';
//            image.style.transformOrigin = 'center center';
//          }
//          // Use demo image URL if available, otherwise use Authvia demo image
//          image.src = demo['Image URL'] || 'https://www.authvia.com/demo/img/vetpayment-t.png';
//          image.alt = demo['Display Name'];
//          image.onerror = function() {
//            this.src = 'https://www.authvia.com/demo/img/vetpayment-t.png';
//          };
//
//          const content = document.createElement('div');
//          let contentClass = 'carousel-content';
//          if (layoutMode === 'horizontal') contentClass += ' horizontal';
//          if (layoutMode === 'auto') contentClass += ' auto-responsive';
//          content.className = contentClass;
//
//          const title = document.createElement('h4');
//          let titleClass = 'carousel-title';
//          if (layoutMode === 'horizontal') titleClass += ' horizontal';
//          if (layoutMode === 'auto') titleClass += ' auto-responsive';
//          title.className = titleClass;
//          title.textContent = demo['Display Name'];
//
//          const vertical = document.createElement('p');
//          let verticalClass = 'carousel-vertical';
//          if (layoutMode === 'horizontal') verticalClass += ' horizontal';
//          if (layoutMode === 'auto') verticalClass += ' auto-responsive';
//          vertical.className = verticalClass;
//          vertical.textContent = demo['Business Vertical'] || 'Other';
//
//          content.appendChild(title);
//          content.appendChild(vertical);
//
//          // Add description if available
//          if (demo['Description']) {
//            const description = document.createElement('p');
//            let descClass = 'carousel-description';
//            if (layoutMode === 'horizontal') descClass += ' horizontal';
//            if (layoutMode === 'auto') descClass += ' auto-responsive';
//            description.className = descClass;
//            description.textContent = demo['Description'];
//            content.appendChild(description);
//          }
//
//          slide.appendChild(image);
//          slide.appendChild(content);
//          carouselContainer.appendChild(slide);
//          carouselSlides.push(slide);
//
//          // Dots removed to save space
//        });
//
//        // Show first slide
//        if (carouselSlides.length > 0) {
//          showSlide(0);
//        }
//      }
//
//      // Touch/swipe event handlers
//      function handleTouchStart(e) {
//        touchStartX = e.touches[0].clientX;
//        isSwiping = false;
//      }
//
//      function handleTouchMove(e) {
//        if (!touchStartX) return;
//
//        touchEndX = e.touches[0].clientX;
//        const diffX = touchStartX - touchEndX;
//
//        // Prevent default scrolling if we're swiping horizontally
//        if (Math.abs(diffX) > 10) {
//          e.preventDefault();
//          isSwiping = true;
//        }
//      }
//
//      function handleTouchEnd(e) {
//        if (!touchStartX || !isSwiping) return;
//
//        const diffX = touchStartX - touchEndX;
//        const minSwipeDistance = 50; // Minimum distance for a swipe
//
//        if (Math.abs(diffX) > minSwipeDistance) {
//          if (diffX > 0) {
//            // Swiped left - next slide
//            nextSlide();
//          } else {
//            // Swiped right - previous slide
//            prevSlide();
//          }
//        }
//
//        // Reset touch state
//        touchStartX = 0;
//        touchEndX = 0;
//        isSwiping = false;
//      }
//
//      async function loadDemos() {
//        const url = 'https://script.google.com/macros/s/AKfycbw6WspplD6pAOXymN-PFj3yAhN2uXnUA2gx-HDRA5OYN5pDnz11OJ507kmL5SZy20_4bA/exec';
//        const args = `?location=${encodeURIComponent(src)}&listfilter=${encodeURIComponent(listFilter)}&embedHost=${encodeURIComponent(referrer)}&action=setup`;
//
//        try {
//          const response = await fetch(url + args);
//          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
//
//          let responseText = await response.text();
//          responseText = responseText.replace(/XXX333XXX/g, '');
//          demos = JSON.parse(responseText);
//
//                // Setup carousel if enabled
//      if (useCarousel || carouselOnly) {
//        carouselContainer.classList.add('active');
//        createCarousel(demos);
//      } else if (hideCarousel) {
//        // Hide carousel section when carousel is explicitly disabled
//        carouselContainer.style.display = 'none';
//        // Also hide the carousel section container to not reserve space
//        const carouselSection = document.getElementById('carouselSection');
//        if (carouselSection) {
//          carouselSection.style.display = 'none';
//        }
//      } else {
//        // Default behavior when carousel parameter is omitted
//        carouselContainer.style.display = 'none';
//      }
//
//      // Setup dropdown if not carousel-only
//      if (!carouselOnly) {
//        demoSelector.classList.add('active');
//
//            demoSelect.innerHTML = '';
//            const grouped = {};
//            demos.forEach(demo => {
//              const vertical = demo['Business Vertical'] || 'Other';
//              if (!grouped[vertical]) grouped[vertical] = [];
//              grouped[vertical].push(demo);
//            });
//
//            const sortedVerticals = Object.keys(grouped).sort();
//            sortedVerticals.forEach(vertical => {
//              const optgroup = document.createElement('optgroup');
//              optgroup.label = vertical;
//              grouped[vertical].forEach(demo => {
//                const option = document.createElement('option');
//                option.textContent = demo['Display Name'];
//                option.value = `${demo['AVID']},${demo['Trigger Id']}`;
//                optgroup.appendChild(option);
//              });
//              demoSelect.appendChild(optgroup);
//            });
//
//            if (demoSelect.options.length > 0) demoSelect.selectedIndex = 0;
//          }
//
//          // Add dropdown change listener for bidirectional sync
//          demoSelect.addEventListener('change', function() {
//            if (isUpdatingFromCarousel) return; // Prevent infinite loops
//
//            const selectedValue = this.value;
//            if (!selectedValue) return;
//
//            const [avid, triggerId] = selectedValue.split(',');
//
//            // Find the corresponding demo index
//            const demoIndex = demos.findIndex(demo =>
//              demo['AVID'] === avid && demo['Trigger Id'] === triggerId
//            );
//
//            if (demoIndex !== -1) {
//              showSlide(demoIndex);
//            }
//          });
//
//        } catch (err) {
//          console.error('Error loading demos:', err);
//          demoSelect.innerHTML = '<option value="">Error loading demos</option>';
//        }
//      }
//
//      submitBtn.addEventListener('click', () => {
//        phoneError.style.display = 'none';
//        const phoneRaw = phoneInput.value.trim();
//        const phoneDigits = phoneRaw.replace(/[^\d]/g, '');
//
//        if (!/^\d{10}$/.test(phoneDigits)) {
//          phoneError.textContent = 'Please enter a valid 10-digit US phone number.';
//          phoneError.style.display = 'block';
//          phoneInput.focus();
//          return;
//        }
//
//        // Get demo values from current slide or dropdown
//        let avid, triggerId;
//        if (demos.length > 0 && currentSlide < demos.length) {
//          // Use current carousel selection
//          avid = demos[currentSlide]['AVID'];
//          triggerId = demos[currentSlide]['Trigger Id'];
//        } else if (demoSelect.value) {
//          // Fallback to dropdown selection
//          [avid, triggerId] = demoSelect.value.split(',');
//        }
//
//        if (!avid || !triggerId) {
//          alert('Please select a demo from the dropdown or carousel.');
//          return;
//        }
//
//        const payload = {
//          phone: phoneDigits,
//          avid,
//          triggerId,
//          src,
//          listFilter,
//          embedHost: referrer
//        };
//
//        submitBtn.classList.add('loading');
//        submitBtn.textContent = 'Sending...';
//
//        fetch('https://script.google.com/macros/s/AKfycbw6WspplD6pAOXymN-PFj3yAhN2uXnUA2gx-HDRA5OYN5pDnz11OJ507kmL5SZy20_4bA/exec?action=submit', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//          body: new URLSearchParams(payload).toString()
//        })
//          .then(response => {
//            if (response.ok) {
//              container.innerHTML = `
//                <h3 class="fade center">Your TXT2PAY request is on its way!</h3>
//                <div class="fade small-text">
//                  Check your messages to see how easy and fast it is to engage and transact.<br><br>
//                  This demo uses a test card tied to your number—no real charges will be made.<br><br>
//                  Want to try another? Just click below.
//                </div>
//                <button class="fade custom-button" onclick="location.reload()" style="background-color: ${buttonColor};">Try another demo</button>
//              `;
//            } else {
//              alert('Submission failed.');
//              submitBtn.classList.remove('loading');
//              submitBtn.textContent = 'Submit';
//            }
//          })
//          .catch(error => {
//            console.error('Submission error:', error);
//            alert('Network error.');
//            submitBtn.classList.remove('loading');
//            submitBtn.textContent = 'Submit';
//          });
//      });
//
//      loadDemos();
//    });