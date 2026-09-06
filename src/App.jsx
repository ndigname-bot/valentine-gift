import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

// Typewriter Component ONLY for Rewards
const Typewriter = ({ text, speed = 40, onComplete, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
};

// Fade In Component for Questions (used globally)
const FadeIn = ({ children, delay = 0, duration = 0.8 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay }}
  >
    {children}
  </motion.div>
);

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } },
  exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }
};

export default function App() {
  const [stage, setStage] = useState(0); // 0 = Intro, 1 = Map, 2 = Hold Reveal, 3 = Story Final
  
  // Intro State
  const [introStep, setIntroStep] = useState(0);

  // Game Progress State
  const [gameProgress, setGameProgress] = useState(0); // 0=Vacation, 1=Elements, 2=Foundation, 3=Cup
  const [activeModal, setActiveModal] = useState(null);
  
  const [shakingBtn, setShakingBtn] = useState(null);
  const [waterInput, setWaterInput] = useState('');
  const [musicStarted, setMusicStarted] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const audioRef = useRef(null);
  const holdTimerRef = useRef(null);
  const voiceRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Play music on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!musicStarted && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio blocked', e));
        setMusicStarted(true);
      }
    };
    window.addEventListener('click', handleInteraction, { once: true });
    return () => window.removeEventListener('click', handleInteraction);
  }, [musicStarted]);

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ffb6c1', '#98fb98', '#ff4d85'] });
  };

  const handleWrongAnswer = (btnId) => {
    setShakingBtn(btnId);
    setTimeout(() => setShakingBtn(null), 500);
  };

  const completeRound = (nextProgress, rewardModal) => {
    triggerConfetti();
    setGameProgress(nextProgress);
    setActiveModal(rewardModal);
  };

  const treeLineHeight = (gameProgress / 3) * 100;

  // Hold to Reveal Logic
  const startHold = () => {
    setIsHolding(true);
    holdTimerRef.current = setTimeout(() => {
      setStage(3);
      triggerConfetti();
    }, 3000);
  };
  const endHold = () => {
    setIsHolding(false);
    clearTimeout(holdTimerRef.current);
  };

  const toggleVoiceNote = () => {
    if (isPlayingVoice) {
      voiceRef.current.pause();
      setIsPlayingVoice(false);
      if (audioRef.current) audioRef.current.play(); // resume bg music
    } else {
      if (audioRef.current) audioRef.current.pause(); // completely pause bg music
      voiceRef.current.play();
      setIsPlayingVoice(true);
    }
  };

  const handleVoiceEnded = () => {
    setIsPlayingVoice(false);
    if (audioRef.current) audioRef.current.play(); // resume bg music
  };

  const ModernButton = ({ onClick, children, isPrimary, id, colorClass }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      animate={shakingBtn === id ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`modern-btn ${isPrimary ? 'primary' : ''} ${shakingBtn === id ? 'shake' : ''} ${colorClass || ''}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="container">
      <audio ref={audioRef} src="./music.mp3" loop />

      <AnimatePresence mode="wait">
        
        {/* STAGE 0: The Cinematic Intro (Fully Dark, Fade in/out) */}
        {stage === 0 && (
          <motion.div key="stage0" className="dark-intro" exit={{ opacity: 0, transition: { duration: 1.5 } }}>
            <div className="cinematic-box">
              <AnimatePresence mode="wait">
                {introStep === 0 && (
                  <motion.div key="text1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1.5, ease: 'easeInOut' }}>
                    <p className="cinematic-text">
                      Before we begin... put your earphones in. Turn the volume all the way up. And strap in, baby... because we are about to go on a ride. 🚀
                    </p>
                    <FadeIn delay={3}>
                      <ModernButton isPrimary onClick={() => setIntroStep(1)}>I have them in. Let's go.</ModernButton>
                    </FadeIn>
                  </motion.div>
                )}
                
                {introStep === 1 && (
                  <motion.div key="text2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1.5 }}>
                    <p className="cinematic-text">
                      Hey gorgeous... you didn't really think I'd just give you a normal, boring gift did you? 😏
                    </p>
                    <FadeIn delay={3}>
                      <ModernButton isPrimary onClick={() => setIntroStep(2)}>What did you do?</ModernButton>
                    </FadeIn>
                  </motion.div>
                )}

                {introStep === 2 && (
                  <motion.div key="text3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1.5 }}>
                    <p className="cinematic-text">
                      I poured my entire heart into building this little world just for you. But to unlock the real surprise waiting at the end... you're gonna have to earn it.
                    </p>
                    <FadeIn delay={4}>
                      <ModernButton isPrimary onClick={() => setStage(1)}>Oh, it's on.</ModernButton>
                    </FadeIn>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* STAGE 1: The Global Tournament Map */}
        {stage === 1 && (
          <motion.div key="stage1" className="scrollable-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <h1 className="title" style={{ marginTop: '20px' }}>The Challenge</h1>
            <p className="subtitle">Complete the path to unlock your surprise!</p>
            
            <div className="tree-container">
              <div className="tree-line">
                <div className="tree-line-fill" style={{ height: `${treeLineHeight}%` }}></div>
              </div>

              {/* Apex: Cup */}
              <div className="tree-node">
                <div className="tree-node-label">The Prize</div>
                <div 
                  className={`cup-node ${gameProgress < 3 ? 'locked' : 'active'}`}
                  onClick={() => { if (gameProgress === 3) setStage(2); }}
                >
                  🏆
                </div>
              </div>

              {/* Node 3: Foundation */}
              <div className="tree-node">
                <div className="tree-node-label">The Foundation</div>
                <div 
                  className={`node-circle ${gameProgress < 2 ? 'locked' : ''} ${gameProgress === 2 ? 'active' : ''} ${gameProgress > 2 ? 'completed' : ''}`}
                  onClick={() => { if (gameProgress === 2) setActiveModal('foundation'); }}
                >
                  ⛪
                </div>
              </div>

              {/* Node 2: Elements */}
              <div className="tree-node">
                <div className="tree-node-label">The Elements</div>
                <div 
                  className={`node-circle ${gameProgress < 1 ? 'locked' : ''} ${gameProgress === 1 ? 'active' : ''} ${gameProgress > 1 ? 'completed' : ''}`}
                  onClick={() => { if (gameProgress === 1) setActiveModal('elements'); }}
                >
                  🔮
                </div>
              </div>

              {/* Node 1: Vacation */}
              <div className="tree-node">
                <div className="tree-node-label">Round 1</div>
                <div 
                  className={`node-circle ${gameProgress === 0 ? 'active' : ''} ${gameProgress > 0 ? 'completed' : ''}`}
                  onClick={() => { if (gameProgress === 0) setActiveModal('vacation'); }}
                >
                  ✈️
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: Hold to Reveal (Apex clicked) */}
        {stage === 2 && (
          <motion.div key="stage2" className="screen-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card">
              <h1 className="title">Almost there...</h1>
              <p className="subtitle">Press and hold the heart to unlock my final message.</p>
              
              <div className="hold-ring">
                <motion.div 
                  className="hold-heart"
                  animate={{ scale: isHolding ? 1.5 : 1 }}
                  transition={{ duration: 3, ease: 'linear' }}
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                  onTouchEnd={endHold}
                >❤️</motion.div>
                
                <svg width="100%" height="100%" style={{position: 'absolute', top:0, left:0, pointerEvents: 'none'}}>
                  <motion.circle 
                    cx="80" cy="80" r="76" fill="transparent" stroke="#ff4d85" strokeWidth="6"
                    initial={{ pathLength: 0 }} animate={{ pathLength: isHolding ? 1 : 0 }}
                    transition={{ duration: 3, ease: 'linear' }} strokeDasharray="0 1"
                  />
                </svg>
              </div>
              <p className="subtitle" style={{marginTop: '20px'}}>{isHolding ? "Keep holding..." : "Hold for 3 seconds..."}</p>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: Final Story & Feedback */}
        {stage === 3 && (
          <motion.div key="stage3" className="scrollable-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="cursive-title">Our Story</h1>
            
            <div className="photo-stack">
              <motion.div className="photo-card" whileHover={{ scale: 1.02 }}>
                <video src="./yuri1.mp4" autoPlay loop muted playsInline style={{width: '100%', borderRadius: '8px', marginBottom: '20px'}} />
                <p className="caption">You literally give me life. ❤️</p>
              </motion.div>
              <motion.div className="photo-card" whileHover={{ scale: 1.02 }}>
                <img src="./yuri2.jpeg" alt="Us" style={{width: '100%', borderRadius: '8px', marginBottom: '20px', objectFit: 'cover'}} />
                <p className="caption">Giving main character energy.</p>
              </motion.div>
              <motion.div className="photo-card" whileHover={{ scale: 1.02 }}>
                <img src="./yuri3.jpeg" alt="Us" style={{width: '100%', borderRadius: '8px', marginBottom: '20px', objectFit: 'cover'}} />
                <p className="caption">My absolute favorite person.</p>
              </motion.div>
              <motion.div className="photo-card" whileHover={{ scale: 1.02 }}>
                <video src="./yuri4.mp4" autoPlay loop muted playsInline style={{width: '100%', borderRadius: '8px', marginBottom: '20px'}} />
                <p className="caption">I can't wait for a lifetime of this.</p>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {!envelopeOpened ? (
                <motion.div key="closed" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="fancy-envelope" onClick={() => setEnvelopeOpened(true)}>
                  <div style={{fontSize: '4rem', marginBottom: '10px'}}>💌</div>
                  <h2 style={{color: 'var(--dark-pink)'}}>Tap to open</h2>
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card" style={{maxWidth: '100%'}}>
                  <div className="letter-box" style={{border: 'none', boxShadow: 'none', background: 'transparent'}}>
                    <p style={{margin: '15px 0', fontSize: '1.05rem', lineHeight: '1.7', color: '#2d3436', textAlign: 'left'}}>
                      Hey there my love,<br /><br />
                      Well, I think maybe this is not the right time to be doing this 'cause we are not there yet... but hey, I don't care, I still wanna do it. Anyhow, I'm here as a messenger to tell you that God loves you sooo deeply that He is letting me love you too. ❤️<br /><br />
                      Honestly, you're really wonderful. I thank God for the parents that raised you and for the experiences you've gotten—all the painful ones, stupid ones, happy ones, jokable ones... all those made you who I cherish today. And I know there is more coming. But as your zodiac says, you're a tiger 🐅 (well, around me you're a cute kitten though 🥺), but I know you can do all things through God who strengthens you. And mind you, the ways of God are sweeter than honey, trust me on this. Why can't we celebrate birthdays with worship? ✨<br /><br />
                      Yes, you might think you're not the smartest, but I overthink things at times making you look like you're a genius... but you <i>are</i> a genius, you just don't want to show it yet. 🧠😉<br /><br />
                      So long story short, I love you 'cause there's no one like you and you're a great addition to this world. Never let anyone or anything lie to you. Also, think about it, you always say that you guys are managing and stuff, but look at you guys—I think you're doing well! You have your mom looking like she's 20, daily needs met here and there, and everyday you survive. If that isn't a testimony, I don't know what is. 🙌<br /><br />
                      You're probably asking why am I talking soooo much about God? Well, because I feel like it. Who knows, maybe it is a message from God Himself. One thing I know for sure is when you get to know God yourself by your own research, you'll learn a lot. Then you'll know what the scripture meant by "the fear of the Lord is the beginning of wisdom." 📖<br /><br />
                      Anyway, just wanted to say I love you sooooo much and I pray that God will keep you, protect, and guide you. Mwah 💋
                    </p>
                    <p style={{marginTop: '20px', fontFamily: "'Dancing Script', cursive", fontSize: '1.8rem', color: 'var(--dark-pink)'}}>Love forever,<br/>Emmanuel</p>
                    
                    {/* Voice Note Button */}
                    <div style={{marginTop: '40px', textAlign: 'center'}}>
                      <audio ref={voiceRef} src="./voicenote.mp3" onEnded={handleVoiceEnded} />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleVoiceNote}
                        style={{
                          background: isPlayingVoice ? '#ff758c' : 'linear-gradient(135deg, var(--dark-pink), #ff758c)',
                          color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px',
                          fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto',
                          boxShadow: '0 5px 15px rgba(255, 77, 133, 0.3)'
                        }}
                      >
                        {isPlayingVoice ? '⏸️ Listening...' : '▶️ Play Voice Note'}
                        {isPlayingVoice && (
                          <div style={{display: 'flex', gap: '4px', alignItems: 'center', height: '15px'}}>
                            <motion.div animate={{height: ['20%', '100%', '20%']}} transition={{repeat: Infinity, duration: 0.5}} style={{width: '3px', background: 'white', borderRadius: '2px'}} />
                            <motion.div animate={{height: ['40%', '80%', '40%']}} transition={{repeat: Infinity, duration: 0.4}} style={{width: '3px', background: 'white', borderRadius: '2px'}} />
                            <motion.div animate={{height: ['20%', '90%', '20%']}} transition={{repeat: Infinity, duration: 0.6}} style={{width: '3px', background: 'white', borderRadius: '2px'}} />
                          </div>
                        )}
                      </motion.button>
                      <p style={{fontSize: '0.8rem', color: '#888', marginTop: '10px'}}>Make sure your volume is up!</p>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Separated Feedback Section */}
            <div className="feedback-card">
              <h3 style={{fontSize: '1.5rem', color: '#2d3436'}}>Rate My Work ⭐</h3>
              <p className="subtitle" style={{marginBottom: 0}}>Leave a public review for my developer portfolio!</p>
              
              <div className="stars-container">
                {[1,2,3,4,5].map(star => (
                  <motion.span 
                    key={star} 
                    className="star-icon"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ filter: (hoverRating || rating) >= star ? 'none' : 'grayscale(1) opacity(0.3)' }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <textarea rows="3" placeholder="Write a public review about this website..."></textarea>
              <ModernButton isPrimary onClick={() => alert('Sent to Emmanuel!')}>Submit Review</ModernButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals Array (Fades in over the map) */}
      <AnimatePresence>
        {activeModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              
              {/* Node 1 Question */}
              {activeModal === 'vacation' && (
                <>
                  <h2 style={{color: 'var(--dark-pink)', marginBottom: '15px'}}>Round 1 ✈️</h2>
                  <FadeIn delay={0.3}>
                    <p className="question">What country does your bf want to take you on vacation one day?</p>
                    <div className="options-stack">
                      <ModernButton id="japan" colorClass="btn-opt1" onClick={() => completeRound(1, 'reward1')}>Japan 🇯🇵</ModernButton>
                      <ModernButton id="paris" colorClass="btn-opt2" onClick={() => handleWrongAnswer('paris')}>Paris 🇫🇷</ModernButton>
                      <ModernButton id="china" colorClass="btn-opt3" onClick={() => handleWrongAnswer('china')}>China 🇨🇳</ModernButton>
                    </div>
                  </FadeIn>
                </>
              )}

              {/* Node 1 Reward */}
              {activeModal === 'reward1' && (
                <>
                  <h2 style={{color: 'var(--dark-green)', marginBottom: '15px'}}>Bingo! 🇯🇵🎉</h2>
                  <div className="letter-box" style={{fontSize: '1rem'}}>
                    <Typewriter 
                      text="Honestly, I can't wait to drag your cute self all across the globe. From eating stupidly expensive sushi in Tokyo to just getting lost in a random city as long as I'm holding your hand. I appreciate you more than words can say. You're my favorite notification, my literal peace, and my absolute best friend." 
                      speed={30} 
                    />
                    <FadeIn delay={12}>
                      <span style={{display: 'block', marginTop: '15px', color: 'var(--dark-pink)', fontStyle: 'italic'}}>
                        But keep that energy up... because what's waiting for you at the top of this tree? Let's just say... it's something I've been waiting a long time to tell you. 👀
                      </span>
                    </FadeIn>
                  </div>
                  <FadeIn delay={13}>
                    <ModernButton isPrimary onClick={() => setActiveModal(null)}>Return to Map</ModernButton>
                  </FadeIn>
                </>
              )}

              {/* Node 2 Selection (The Big Balls) */}
              {activeModal === 'elements' && (
                <>
                  <h2 style={{color: 'var(--text-main)', marginBottom: '15px'}}>The Elements 🔮</h2>
                  <FadeIn delay={0.3}>
                    <p className="question">Choose one element to prove your love and move forward.</p>
                    <div className="big-balls-container">
                      <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="big-ball ball-water" onClick={() => setActiveModal('water')}>💧<span>Water</span></motion.button>
                      <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="big-ball ball-wind" onClick={() => setActiveModal('wind')}>💨<span>Wind</span></motion.button>
                      <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="big-ball ball-fire" onClick={() => setActiveModal('fire')}>🔥<span>Fire</span></motion.button>
                    </div>
                  </FadeIn>
                </>
              )}
              
              {/* Elements Questions */}
              {activeModal === 'water' && (
                <>
                  <h2 style={{color: '#00b09b', marginBottom: '15px'}}>The Water Element 💧</h2>
                  <FadeIn delay={0.3}>
                    <p className="question">Water represents deep connection. How does my love connect with yours?</p>
                    <div className="options-stack">
                      <ModernButton id="ice" colorClass="btn-opt1" onClick={() => handleWrongAnswer('ice')}>Like ice melting in the sun</ModernButton>
                      <ModernButton id="river" colorClass="btn-opt2" onClick={() => completeRound(2, 'reward2')}>Like a river that effortlessly flows into your ocean</ModernButton>
                      <ModernButton id="pond" colorClass="btn-opt3" onClick={() => handleWrongAnswer('pond')}>Like a quiet, still pond</ModernButton>
                    </div>
                  </FadeIn>
                </>
              )}
              
              {activeModal === 'wind' && (
                <>
                  <h2 style={{color: '#636e72', marginBottom: '15px'}}>The Wind Element 💨</h2>
                  <FadeIn delay={0.3}>
                    <p className="question">What is the one thing Emmanuel would like to do with you?</p>
                    <div className="options-stack">
                      <ModernButton id="both" colorClass="btn-opt1" onClick={() => completeRound(2, 'reward2')}>Be with you through thick and thin</ModernButton>
                      <ModernButton id="cuddle" colorClass="btn-opt2" onClick={() => handleWrongAnswer('cuddle')}>Cuddle</ModernButton>
                      <ModernButton id="kiss" colorClass="btn-opt3" onClick={() => handleWrongAnswer('kiss')}>Kiss</ModernButton>
                    </div>
                  </FadeIn>
                </>
              )}
              
              {activeModal === 'fire' && (
                <>
                  <h2 style={{color: '#ff758c', marginBottom: '15px'}}>The Fire Element 🔥</h2>
                  <FadeIn delay={0.3}>
                    <p className="question">What warms Emmanuel's heart the most?</p>
                    <div className="options-stack">
                      <ModernButton id="dry" colorClass="btn-opt1" onClick={() => handleWrongAnswer('dry')}>Dry text</ModernButton>
                      <ModernButton id="long" colorClass="btn-opt2" onClick={() => handleWrongAnswer('long')}>Sending long text messages</ModernButton>
                      <ModernButton id="affection" colorClass="btn-opt3" onClick={() => completeRound(2, 'reward2')}>Showing random affection and sending sweet sexy photos</ModernButton>
                    </div>
                  </FadeIn>
                </>
              )}

              {/* Node 2 Reward */}
              {activeModal === 'reward2' && (
                <>
                  <h2 style={{color: 'var(--dark-green)', marginBottom: '15px'}}>You did it! 🏆</h2>
                  <div className="letter-box poetry">
                    <Typewriter 
                      text="My love for you is deeper than water, stronger than the wind, and burns brighter than fire. You are my everything." 
                      speed={40} 
                    />
                  </div>
                  <FadeIn delay={5}>
                    <span className="cheeky" style={{display: 'block', marginBottom: '20px'}}>P.S. You're looking incredibly fine today 😏</span>
                    <ModernButton isPrimary onClick={() => setActiveModal(null)}>Return to Map</ModernButton>
                  </FadeIn>
                </>
              )}

              {/* Node 3 Question */}
              {activeModal === 'foundation' && (
                <>
                  <h2 style={{color: 'var(--dark-pink)', marginBottom: '15px'}}>The Foundation ⛪</h2>
                  <FadeIn delay={0.3}>
                    <p className="question">What do you think Emmanuel wants to build your relationship on?</p>
                    <div className="options-stack">
                      <ModernButton id="child" colorClass="btn-opt1" onClick={() => handleWrongAnswer('child')}>For children</ModernButton>
                      <ModernButton id="god" colorClass="btn-opt2" onClick={() => completeRound(3, 'reward3')}>In God 🙏</ModernButton>
                      <ModernButton id="happy" colorClass="btn-opt3" onClick={() => handleWrongAnswer('happy')}>For happiness</ModernButton>
                    </div>
                  </FadeIn>
                </>
              )}

              {/* Node 3 Reward */}
              {activeModal === 'reward3' && (
                <>
                  <h2 style={{color: 'var(--dark-green)', marginBottom: '15px'}}>Perfect. 🙏</h2>
                  <div className="letter-box">
                    <Typewriter 
                      text="With God at the center, there is nothing we can't overcome. He is the foundation of our love and our future together." 
                      speed={40} 
                    />
                  </div>
                  <FadeIn delay={5}>
                    <ModernButton isPrimary onClick={() => setActiveModal(null)}>Claim The Final Prize 🏆</ModernButton>
                  </FadeIn>
                </>
              )}

              {/* Close Button for Modals (Only if not a reward) */}
              {!activeModal.startsWith('reward') && (
                <p style={{marginTop: '20px', cursor: 'pointer', color: '#888', fontSize: '0.9rem'}} onClick={() => setActiveModal(null)}>Cancel</p>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
