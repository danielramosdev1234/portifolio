"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

const GhostBossGame = () => {
  const [gameState, setGameState] = useState('instructions'); // 'instructions', 'playing', 'paused', 'gameOver', 'levelUp'
  const [score, setScore] = useState(1291);
  const [phase, setPhase] = useState(1);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [experienceToNext, setExperienceToNext] = useState(100);
  const [player, setPlayer] = useState({
    x: 350,
    y: 500,
    health: 100,
    maxHealth: 100,
    fireRate: 500,
    damage: 8,
    projectileCount: 1
  });
  const [boss, setBoss] = useState({ x: 350, y: 150, health: 100, maxHealth: 100 });
  const [ghosts, setGhosts] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const [keys, setKeys] = useState({});
  const [lastShot, setLastShot] = useState(0);
  const [damageTexts, setDamageTexts] = useState([]);

  // Estados para controles mobile
  const [isMobile, setIsMobile] = useState(false);
  const [touchControls, setTouchControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false
  });

  const damageTextIdRef = useRef(0);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Gerar fantasmas iniciais
  useEffect(() => {
    const initialGhosts = [];
    for (let i = 0; i < 15; i++) {
      initialGhosts.push({
        id: i,
        x: Math.random() * 650 + 50,
        y: Math.random() * 300 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        health: 10
      });
    }
    setGhosts(initialGhosts);
  }, []);

  // Função para adicionar texto de dano
  const addDamageText = (x, y, damage, type = 'damage') => {
    damageTextIdRef.current += 1;
    const newDamageText = {
      id: `damage_${damageTextIdRef.current}_${Date.now()}`,
      x: x,
      y: y,
      damage: damage,
      type: type,
      opacity: 1,
      offsetY: 0
    };

    setDamageTexts(prev => [...prev, newDamageText]);

    setTimeout(() => {
      setDamageTexts(prev => prev.filter(text => text.id !== newDamageText.id));
    }, 1000);
  };

  // Animar textos de dano
  useEffect(() => {
    const interval = setInterval(() => {
      setDamageTexts(prev => prev.map(text => ({
        ...text,
        opacity: text.opacity - 0.05,
        offsetY: text.offsetY - 2
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Controles do teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Controles touch para mobile
  const handleTouchStart = (direction) => {
    setTouchControls(prev => ({ ...prev, [direction]: true }));
  };

  const handleTouchEnd = (direction) => {
    setTouchControls(prev => ({ ...prev, [direction]: false }));
  };

  // Loop principal do jogo
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Movimento do jogador (combinando teclado e touch)
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;

        // Controles de teclado
        if (keys['ArrowLeft'] || keys['a'] || touchControls.left) newX = Math.max(20, prev.x - 5);
        if (keys['ArrowRight'] || keys['d'] || touchControls.right) newX = Math.min(680, prev.x + 5);
        if (keys['ArrowUp'] || keys['w'] || touchControls.up) newY = Math.max(350, prev.y - 5);
        if (keys['ArrowDown'] || keys['s'] || touchControls.down) newY = Math.min(580, prev.y + 5);

        return { ...prev, x: newX, y: newY };
      });

      // Tiro automático do jogador
      const now = Date.now();
      if (now - lastShot > player.fireRate) {
        const newProjectiles = [];

        if (player.projectileCount === 1) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x,
            y: player.y - 30,
            vx: 0,
            vy: -6,
            type: 'player'
          });
        } else if (player.projectileCount === 2) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x - 15,
            y: player.y - 30,
            vx: -1,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_1`,
            x: player.x + 15,
            y: player.y - 30,
            vx: 1,
            vy: -6,
            type: 'player'
          });
        } else if (player.projectileCount === 3) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x,
            y: player.y - 30,
            vx: 0,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_1`,
            x: player.x - 20,
            y: player.y - 30,
            vx: -1.5,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_2`,
            x: player.x + 20,
            y: player.y - 30,
            vx: 1.5,
            vy: -6,
            type: 'player'
          });
        } else if (player.projectileCount === 4) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x - 10,
            y: player.y - 30,
            vx: -0.5,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_1`,
            x: player.x + 10,
            y: player.y - 30,
            vx: 0.5,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_2`,
            x: player.x - 25,
            y: player.y - 30,
            vx: -2,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_3`,
            x: player.x + 25,
            y: player.y - 30,
            vx: 2,
            vy: -6,
            type: 'player'
          });
        } else if (player.projectileCount === 5) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x,
            y: player.y - 30,
            vx: 0,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_1`,
            x: player.x - 15,
            y: player.y - 30,
            vx: -1,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_2`,
            x: player.x + 15,
            y: player.y - 30,
            vx: 1,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_3`,
            x: player.x - 30,
            y: player.y - 30,
            vx: -2.5,
            vy: -6,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_4`,
            x: player.x + 30,
            y: player.y - 30,
            vx: 2.5,
            vy: -6,
            type: 'player'
          });
        }

        setProjectiles(prev => [...prev, ...newProjectiles]);
        setLastShot(now);
      }

      // Movimento dos fantasmas
      setGhosts(prev => prev.map(ghost => ({
        ...ghost,
        x: Math.max(20, Math.min(680, ghost.x + ghost.vx)),
        y: Math.max(50, Math.min(320, ghost.y + ghost.vy)),
        vx: ghost.x <= 20 || ghost.x >= 680 ? -ghost.vx : ghost.vx,
        vy: ghost.y <= 50 || ghost.y >= 320 ? -ghost.vy : ghost.vy
      })));

      // Movimento do boss
      setBoss(prev => ({
        ...prev,
        x: prev.x + Math.sin(Date.now() * 0.002) * 2
      }));

      // Tiro do boss
      if (Math.random() < 0.02) {
        setBossProjectiles(prev => [...prev, {
          id: `boss_proj_${Date.now()}_${Math.random()}`,
          x: boss.x,
          y: boss.y + 30,
          vx: (player.x - boss.x) * 0.02,
          vy: 4,
          type: 'boss'
        }]);
      }

      // Movimento dos projéteis
      setProjectiles(prev =>
        prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
            .filter(p => p.y > 0 && p.y < 600)
      );

      setBossProjectiles(prev =>
        prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
            .filter(p => p.y > 0 && p.y < 600)
      );

      // Colisões magia do jogador com fantasmas
      setProjectiles(prev => {
        const remaining = [];
        prev.forEach(proj => {
          let hit = false;
          setGhosts(prevGhosts => {
            return prevGhosts.map(ghost => {
              if (!hit && Math.abs(ghost.x - proj.x) < 30 && Math.abs(ghost.y - proj.y) < 30) {
                hit = true;
                const newHealth = ghost.health - player.damage;

                addDamageText(ghost.x, ghost.y, player.damage, 'damage');

                if (newHealth <= 0) {
                  const baseExp = 15;
                  const phaseMultiplier = 1 + (phase - 1) * 0.3;
                  const expGained = Math.floor(baseExp * phaseMultiplier);

                  setScore(s => s + 10);
                  addDamageText(ghost.x, ghost.y - 20, `+${expGained} EXP`, 'exp');
                  addDamageText(ghost.x, ghost.y - 40, 'KILL!', 'kill');

                  setExperience(exp => {
                    const newExp = exp + expGained;
                    if (newExp >= experienceToNext) {
                      setGameState('levelUp');
                      return 0;
                    }
                    return newExp;
                  });

                  return null;
                } else {
                  const ghostMaxHealth = Math.floor(10 * Math.pow(1.5, phase - 1));
                  addDamageText(ghost.x, ghost.y - 20, `${newHealth}/${ghostMaxHealth}`, 'health');
                  return { ...ghost, health: newHealth };
                }
              }
              return ghost;
            }).filter(Boolean);
          });
          if (!hit) remaining.push(proj);
        });
        return remaining;
      });

      // Colisões magia do jogador com boss
      setProjectiles(prev => {
        const remaining = [];
        prev.forEach(proj => {
          if (Math.abs(boss.x - proj.x) < 45 && Math.abs(boss.y - proj.y) < 45) {
            setBoss(prevBoss => {
              const newHealth = Math.max(0, prevBoss.health - player.damage);

              addDamageText(boss.x, boss.y, player.damage, 'damage');
              addDamageText(boss.x, boss.y - 20, `${newHealth}/${prevBoss.maxHealth}`, 'health');

              if (prevBoss.health > 0 && newHealth === 0) {
                const bossExp = 100;
                addDamageText(boss.x, boss.y - 40, `+${bossExp} EXP`, 'exp');
                addDamageText(boss.x, boss.y - 60, 'BOSS KILLED!', 'kill');

                setExperience(exp => {
                  const newExp = exp + bossExp;
                  if (newExp >= experienceToNext) {
                    setGameState('levelUp');
                    return 0;
                  }
                  return newExp;
                });
              }
              return { ...prevBoss, health: newHealth };
            });
            setScore(s => s + 50);
          } else {
            remaining.push(proj);
          }
        });
        return remaining;
      });

      // Colisões projétil do boss com jogador
      setBossProjectiles(prev => {
        const remaining = [];
        prev.forEach(proj => {
          if (Math.abs(player.x - proj.x) < 30 && Math.abs(player.y - proj.y) < 30) {
            setPlayer(prevPlayer => {
              const newHealth = Math.max(0, prevPlayer.health - 10);
              addDamageText(player.x, player.y, 10, 'damage');
              return { ...prevPlayer, health: newHealth };
            });
          } else {
            remaining.push(proj);
          }
        });
        return remaining;
      });

      // Verificar game over
      if (player.health <= 0) {
        setGameState('gameOver');
      }

      // Verificar vitória
      if (boss.health <= 0) {
        setPhase(prev => prev + 1);

        setBoss(prev => ({
          ...prev,
          health: prev.maxHealth * 2,
          maxHealth: prev.maxHealth * 2,
          x: 350,
          y: 150
        }));

        const newGhosts = [];
        const ghostMaxHealth = Math.floor(10 * Math.pow(1.5, phase - 1));

        for (let i = 0; i < 15 + phase * 2; i++) {
          newGhosts.push({
            id: Date.now() + i,
            x: Math.random() * 650 + 50,
            y: Math.random() * 300 + 50,
            vx: (Math.random() - 0.5) * (2 + phase * 0.5),
            vy: (Math.random() - 0.5) * (2 + phase * 0.5),
            health: ghostMaxHealth
          });
        }
        setGhosts(newGhosts);
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, keys, touchControls, player, boss, lastShot, ghosts.length, phase, experienceToNext]);

  const selectUpgrade = (upgrade) => {
    setPlayer(prev => {
      let updatedPlayer = { ...prev };

      switch(upgrade) {
        case 'fireRate':
          updatedPlayer.fireRate = Math.max(100, prev.fireRate - 100);
          break;
        case 'projectileCount':
          updatedPlayer.projectileCount = Math.min(5, prev.projectileCount + 1);
          break;
        case 'damage':
          updatedPlayer.damage = prev.damage + 4;
          break;
        default:
          break;
      }

      updatedPlayer.maxHealth = prev.maxHealth + 2;
      updatedPlayer.health = Math.min(updatedPlayer.maxHealth, prev.health + 5);

      return updatedPlayer;
    });

    setLevel(prev => prev + 1);
    setExperienceToNext(prev => Math.floor(prev * 1.1));

    setGameState('playing');
  };

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const resetGame = () => {
    setGameState('instructions');
    setScore(1291);
    setPhase(1);
    setLevel(1);
    setExperience(0);
    setExperienceToNext(100);
    setPlayer({
      x: 350,
      y: 500,
      health: 100,
      maxHealth: 100,
      fireRate: 500,
      damage: 8,
      projectileCount: 1
    });
    setBoss({ x: 350, y: 150, health: 100, maxHealth: 100 });
    setProjectiles([]);
    setBossProjectiles([]);
    setDamageTexts([]);
    setTouchControls({ up: false, down: false, left: false, right: false });

    damageTextIdRef.current = 0;

    const initialGhosts = [];
    for (let i = 0; i < 15; i++) {
      initialGhosts.push({
        id: i,
        x: Math.random() * 650 + 50,
        y: Math.random() * 300 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        health: 10
      });
    }
    setGhosts(initialGhosts);
  };

  const startGame = () => {
    setGameState('playing');
  };

  // Componente dos botões de controle móvel
  const MobileControls = () => {
    if (!isMobile || gameState !== 'playing') return null;

    const buttonStyle = {
      position: 'absolute',
      width: '60px',
      height: '60px',
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      border: '2px solid #3b82f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: 'white',
      userSelect: 'none',
      touchAction: 'manipulation'
    };

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        height: '200px',
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        {/* Botão para cima */}
        <div
          style={{
            ...buttonStyle,
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto'
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart('up');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouchEnd('up');
          }}
          onMouseDown={() => handleTouchStart('up')}
          onMouseUp={() => handleTouchEnd('up')}
          onMouseLeave={() => handleTouchEnd('up')}
        >
          ⬆️
        </div>

        {/* Botão para baixo */}
        <div
          style={{
            ...buttonStyle,
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto'
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart('down');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouchEnd('down');
          }}
          onMouseDown={() => handleTouchStart('down')}
          onMouseUp={() => handleTouchEnd('down')}
          onMouseLeave={() => handleTouchEnd('down')}
        >
          ⬇️
        </div>

        {/* Botão para esquerda */}
        <div
          style={{
            ...buttonStyle,
            bottom: '70px',
            left: 'calc(50% - 80px)',
            pointerEvents: 'auto'
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart('left');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouchEnd('left');
          }}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onMouseLeave={() => handleTouchEnd('left')}
        >
          ⬅️
        </div>

        {/* Botão para direita */}
        <div
          style={{
            ...buttonStyle,
            bottom: '70px',
            right: 'calc(50% - 80px)',
            pointerEvents: 'auto'
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart('right');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouchEnd('right');
          }}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onMouseLeave={() => handleTouchEnd('right')}
        >
          ➡️
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      color: 'white',
      backgroundColor: '#1a202c',
      borderRadius: '20px',
      padding: isMobile ? '10px' : '20px',
      minHeight: '80vh',
      position: 'relative'
    }}>
      {/* Interface superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={togglePause}
          style={{
            backgroundColor: '#3182ce',
            color: 'white',
            padding: isMobile ? '6px 12px' : '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '16px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2c5aa0'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3182ce'}
        >
          ⏸️
        </button>

        <div style={{
          backgroundColor: '#dc2626',
          padding: isMobile ? '6px 12px' : '8px 24px',
          borderRadius: '8px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold' }}>CARTÃO CHEFE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: isMobile ? '20px' : '24px' }}>💰</span>
          <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold' }}>{score}</span>
          <span style={{ fontSize: isMobile ? '20px' : '24px' }}>💰</span>
        </div>
      </div>

      <div style={{
        backgroundColor: 'black',
        padding: isMobile ? '6px 12px' : '8px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '16px',
        fontSize: isMobile ? '12px' : '14px'
      }}>
        <span>FASE {phase}</span>
        <span style={{ color: '#fbbf24' }}>NÍVEL {level}</span>
        <span style={{ color: '#10b981' }}>EXP Boleto: +{Math.floor(15 * (1 + (phase - 1) * 0.3))}</span>
      </div>

      {/* Barra de Experiência */}
      <div style={{
        width: isMobile ? '280px' : '320px',
        height: '16px',
        backgroundColor: '#374151',
        borderRadius: '9999px',
        marginBottom: '16px',
        border: '2px solid #6b7280'
      }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
            borderRadius: '9999px',
            transition: 'width 0.3s',
            width: `${(experience / experienceToNext) * 100}%`
          }}
        />
        <div style={{
          fontSize: '12px',
          textAlign: 'center',
          color: 'white',
          marginTop: '-14px'
        }}>
          EXP: {experience}/{experienceToNext}
        </div>
      </div>

      {/* Área do jogo */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#374151',
          border: '4px solid #6b7280',
          overflow: 'hidden',
          width: isMobile ? Math.min(window.innerWidth - 40, 700) + 'px' : '700px',
          height: isMobile ? Math.min(window.innerHeight * 0.6, 600) + 'px' : '600px',
          cursor: gameState === 'instructions' ? 'pointer' : 'default'
        }}
        onClick={gameState === 'instructions' ? startGame : undefined}
      >
        {/* Boletos */}
        {gameState !== 'instructions' && ghosts.map(ghost => (
          <div
            key={ghost.id}
            style={{
              position: 'absolute',
              fontSize: isMobile ? '20px' : '24px',
              left: ghost.x - 15,
              top: ghost.y - 15,
              transform: 'translate(-50%, -50%)'
            }}
          >
            📄
            <div style={{ width: '24px', height: '4px', backgroundColor: '#7f1d1d', borderRadius: '2px', marginTop: '4px' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '2px',
                  transition: 'width 0.3s',
                  width: `${(ghost.health / Math.floor(10 * Math.pow(1.5, phase - 1))) * 100}%`
                }}
              />
            </div>
          </div>
        ))}

        {/* Boss */}
        {gameState !== 'instructions' && boss.health > 0 && (
          <div
            style={{
              position: 'absolute',
              left: boss.x - 30,
              top: boss.y - 30,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div style={{ fontSize: isMobile ? '40px' : '48px' }}>💳</div>
            <div style={{ width: '64px', height: '8px', backgroundColor: '#7f1d1d', borderRadius: '4px', marginTop: '4px' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  transition: 'width 0.3s',
                  width: `${(boss.health / boss.maxHealth) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Jogador */}
        {gameState !== 'instructions' && (
          <div
            style={{
              position: 'absolute',
              left: player.x - 20,
              top: player.y - 20,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div style={{ fontSize: isMobile ? '28px' : '32px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🤵💼
            </div>
            <div style={{ width: '48px', height: '8px', backgroundColor: '#7f1d1d', borderRadius: '4px', marginTop: '4px' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  transition: 'width 0.3s',
                  width: `${(player.health / player.maxHealth) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Projéteis do jogador */}
        {gameState !== 'instructions' && projectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              fontSize: '16px',
              left: proj.x - 8,
              top: proj.y - 8,
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            💸
          </div>
        ))}

        {/* Projéteis do boss */}
        {gameState !== 'instructions' && bossProjectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              fontSize: '16px',
              color: '#dc2626',
              fontWeight: 'bold',
              left: proj.x - 8,
              top: proj.y - 8,
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            ✖
          </div>
        ))}

        {/* Textos de dano flutuantes */}
        {gameState !== 'instructions' && damageTexts.map(text => (
          <div
            key={text.id}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              fontWeight: 'bold',
              fontSize: text.type === 'kill' ? '16px' : '12px',
              left: text.x,
              top: text.y + text.offsetY,
              opacity: text.opacity,
              color: text.type === 'damage' ? '#ff4444' :
                     text.type === 'exp' ? '#ffdd44' :
                     text.type === 'kill' ? '#44ff44' :
                     '#ffffff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.05s ease-out'
            }}
          >
            {text.type === 'damage' ? `-${text.damage}` :
             text.type === 'health' ? text.damage :
             text.damage}
          </div>
        ))}

        {/* Overlay de instruções */}
        {gameState === 'instructions' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '20px'
          }}>
            <div style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: 'bold',
              marginBottom: '32px',
              color: '#fbbf24',
              textAlign: 'center'
            }}>
              🤵💼 BATALHA FINANCEIRA 💳📄
            </div>
            <div style={{
              fontSize: isMobile ? '18px' : '24px',
              marginBottom: '32px',
              textAlign: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '2px solid #3b82f6'
            }}>
              {isMobile ? 'Use os controles na tela • Tiro automático' : 'Use WASD ou setas para mover • Tiro automático'}
            </div>
            <div style={{ fontSize: '18px', color: '#9ca3af', textAlign: 'center' }}>
              Toque para iniciar o jogo
            </div>
          </div>
        )}

        {/* Overlay de level up */}
        {gameState === 'levelUp' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 'bold', marginBottom: '24px', color: '#fbbf24' }}>PROMOÇÃO!</div>
            <div style={{ fontSize: isMobile ? '16px' : '20px', marginBottom: '32px', textAlign: 'center' }}>Escolha seu upgrade financeiro:</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px' }}>
              <button
                onClick={() => selectUpgrade('fireRate')}
                disabled={player.fireRate <= 100}
                style={{
                  backgroundColor: player.fireRate <= 100 ? '#6b7280' : '#2563eb',
                  color: 'white',
                  padding: isMobile ? '12px 24px' : '16px 32px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '18px',
                  border: 'none',
                  cursor: player.fireRate <= 100 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => {
                  if (player.fireRate > 100) e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  if (player.fireRate > 100) e.target.style.backgroundColor = '#2563eb';
                }}
              >
                ⚡ Agilidade Financeira
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {player.fireRate <= 100 ? 'MAX' : `${player.fireRate}ms → ${Math.max(100, player.fireRate - 100)}ms`}
                </div>
              </button>

              <button
                onClick={() => selectUpgrade('projectileCount')}
                disabled={player.projectileCount >= 5}
                style={{
                  backgroundColor: player.projectileCount >= 5 ? '#6b7280' : '#059669',
                  color: 'white',
                  padding: isMobile ? '12px 24px' : '16px 32px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '18px',
                  border: 'none',
                  cursor: player.projectileCount >= 5 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => {
                  if (player.projectileCount < 5) e.target.style.backgroundColor = '#047857';
                }}
                onMouseOut={(e) => {
                  if (player.projectileCount < 5) e.target.style.backgroundColor = '#059669';
                }}
              >
                🎯 Múltiplas Rendas Passivas
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {player.projectileCount >= 5 ? 'MÁXIMO ATINGIDO' : `${player.projectileCount} → ${player.projectileCount + 1} projéteis`}
                </div>
              </button>

              <button
                onClick={() => selectUpgrade('damage')}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: isMobile ? '12px 24px' : '16px 32px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '18px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                💼 Poder de Negociação
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {player.damage} → {player.damage + 4} de dano
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Overlay de pause */}
        {gameState === 'paused' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 'bold' }}>PAUSADO</div>
          </div>
        )}

        {/* Overlay de game over */}
        {gameState === 'gameOver' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>FALÊNCIA!</div>
            <div style={{ fontSize: isMobile ? '16px' : '20px', marginBottom: '8px' }}>Capital Final: {score}</div>
            <div style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '8px', color: '#fbbf24' }}>Fase Alcançada: {phase}</div>
            <div style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '16px', color: '#10b981' }}>Nível Alcançado: {level}</div>
            <button
              onClick={resetGame}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: isMobile ? '10px 20px' : '12px 24px',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '20px',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              NOVO NEGÓCIO
            </button>
          </div>
        )}
      </div>

      {/* Controles */}
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        fontSize: isMobile ? '12px' : '14px',
        color: '#9ca3af'
      }}>
        <p>{isMobile ? 'Use os controles na tela para mover • Tiro automático corporativo!' : 'Use WASD ou setas para mover • Tiro automático corporativo!'}</p>
        <p>Derrote apenas o cartão-chefe para expandir os negócios!</p>
      </div>

      {/* Stats do jogador */}
      <div style={{
        marginTop: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: isMobile ? '8px' : '16px',
        fontSize: isMobile ? '12px' : '14px',
        justifyContent: 'center'
      }}>
        <span>Boletos: {ghosts.length}</span>
        <span>Cartão-Chefe: {boss.health}/{boss.maxHealth}</span>
        <span>Saúde: {player.health}/{player.maxHealth}</span>
        <span>Rendas: {player.projectileCount}</span>
        <span>Dano: {player.damage}</span>
        <span>Vel.Tiro: {player.fireRate}ms</span>
      </div>

      {/* Controles Mobile */}
      <MobileControls />
    </div>
  );
};

export default GhostBossGame;