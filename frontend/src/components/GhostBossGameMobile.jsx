"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

const GhostBossGameMobile = () => {
  const [gameState, setGameState] = useState('instructions'); // 'instructions', 'playing', 'paused', 'gameOver', 'levelUp'
  const [score, setScore] = useState(1291);
  const [phase, setPhase] = useState(1);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [experienceToNext, setExperienceToNext] = useState(100);
  const [player, setPlayer] = useState({
    x: 175,
    y: 400,
    health: 100,
    maxHealth: 100,
    fireRate: 500,
    damage: 8,
    projectileCount: 1
  });
  const [boss, setBoss] = useState({ x: 175, y: 120, health: 100, maxHealth: 100 });
  const [ghosts, setGhosts] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const [lastShot, setLastShot] = useState(0);
  const [damageTexts, setDamageTexts] = useState([]);

  // Mobile controls
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState({ x: 0, y: 0 });

  // Use a ref to keep track of unique IDs
  const damageTextIdRef = useRef(0);
  const gameAreaRef = useRef(null);

  // Mobile game dimensions
  const gameWidth = 350;
  const gameHeight = 500;

  // Generate initial ghosts
  useEffect(() => {
    const initialGhosts = [];
    for (let i = 0; i < 10; i++) {
      initialGhosts.push({
        id: i,
        x: Math.random() * (gameWidth - 100) + 50,
        y: Math.random() * 250 + 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        health: 10
      });
    }
    setGhosts(initialGhosts);
  }, []);

  // Unified input handling
  const startMovement = (clientX, clientY) => {
    if (gameState !== 'playing') return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate direction from player to touch/click point
    const deltaX = x - player.x;
    const deltaY = y - player.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 10) {
      setMoveDirection({
        x: deltaX / distance,
        y: deltaY / distance
      });
      setIsMoving(true);
    }
  };

  const stopMovement = () => {
    setIsMoving(false);
    setMoveDirection({ x: 0, y: 0 });
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    // Don't prevent default for buttons and overlays
    if (gameState === 'levelUp' || gameState === 'gameOver' || e.target.tagName === 'BUTTON') {
      return;
    }

    e.preventDefault();
    if (gameState === 'instructions') {
      startGame();
      return;
    }

    const touch = e.touches[0];
    startMovement(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();

    const touch = e.touches[0];
    startMovement(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    stopMovement();
  };

  // Mouse handlers (fallback)
  const handleMouseDown = (e) => {
    if (gameState === 'levelUp' || gameState === 'gameOver' || e.target.tagName === 'BUTTON') {
      return;
    }

    if (gameState === 'instructions') {
      startGame();
      return;
    }
    startMovement(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isMoving || gameState !== 'playing') return;
    startMovement(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (gameState === 'playing') {
      stopMovement();
    }
  };

  // Function to add damage text
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

  // Animate damage texts
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

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Player movement
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (isMoving) {
          newX = Math.max(20, Math.min(gameWidth - 20, prev.x + moveDirection.x * 4));
          newY = Math.max(280, Math.min(gameHeight - 20, prev.y + moveDirection.y * 4));
        }

        return { ...prev, x: newX, y: newY };
      });

      // Automatic shooting
      const now = Date.now();
      if (now - lastShot > player.fireRate) {
        const newProjectiles = [];

        if (player.projectileCount === 1) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x,
            y: player.y - 20,
            vx: 0,
            vy: -5,
            type: 'player'
          });
        } else if (player.projectileCount === 2) {
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x - 10,
            y: player.y - 20,
            vx: -0.5,
            vy: -5,
            type: 'player'
          });
          newProjectiles.push({
            id: `proj_${now}_1`,
            x: player.x + 10,
            y: player.y - 20,
            vx: 0.5,
            vy: -5,
            type: 'player'
          });
        } else if (player.projectileCount >= 3) {
          newProjectiles.push(
            {
              id: `proj_${now}_0`,
              x: player.x,
              y: player.y - 20,
              vx: 0,
              vy: -5,
              type: 'player'
            },
            {
              id: `proj_${now}_1`,
              x: player.x - 15,
              y: player.y - 20,
              vx: -1,
              vy: -5,
              type: 'player'
            },
            {
              id: `proj_${now}_2`,
              x: player.x + 15,
              y: player.y - 20,
              vx: 1,
              vy: -5,
              type: 'player'
            }
          );
        }

        if (player.projectileCount >= 4) {
          newProjectiles.push({
            id: `proj_${now}_3`,
            x: player.x - 25,
            y: player.y - 20,
            vx: -1.5,
            vy: -5,
            type: 'player'
          });
        }

        if (player.projectileCount >= 5) {
          newProjectiles.push({
            id: `proj_${now}_4`,
            x: player.x + 25,
            y: player.y - 20,
            vx: 1.5,
            vy: -5,
            type: 'player'
          });
        }

        setProjectiles(prev => [...prev, ...newProjectiles]);
        setLastShot(now);
      }

      // Ghost movement
      setGhosts(prev => prev.map(ghost => ({
        ...ghost,
        x: Math.max(20, Math.min(gameWidth - 20, ghost.x + ghost.vx)),
        y: Math.max(50, Math.min(260, ghost.y + ghost.vy)),
        vx: ghost.x <= 20 || ghost.x >= gameWidth - 20 ? -ghost.vx : ghost.vx,
        vy: ghost.y <= 50 || ghost.y >= 260 ? -ghost.vy : ghost.vy
      })));

      // Boss movement
      setBoss(prev => ({
        ...prev,
        x: Math.max(30, Math.min(gameWidth - 30, prev.x + Math.sin(Date.now() * 0.002) * 1.5))
      }));

      // Boss shooting
      if (Math.random() < 0.015) {
        setBossProjectiles(prev => [...prev, {
          id: `boss_proj_${Date.now()}_${Math.random()}`,
          x: boss.x,
          y: boss.y + 20,
          vx: (player.x - boss.x) * 0.015,
          vy: 3,
          type: 'boss'
        }]);
      }

      // Move projectiles
      setProjectiles(prev =>
        prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
            .filter(p => p.y > 0 && p.y < gameHeight)
      );

      setBossProjectiles(prev =>
        prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
            .filter(p => p.y > 0 && p.y < gameHeight)
      );

      // Player projectile collisions with ghosts
      setProjectiles(prev => {
        const remaining = [];
        prev.forEach(proj => {
          let hit = false;
          setGhosts(prevGhosts => {
            return prevGhosts.map(ghost => {
              if (!hit && Math.abs(ghost.x - proj.x) < 25 && Math.abs(ghost.y - proj.y) < 25) {
                hit = true;
                const newHealth = ghost.health - player.damage;

                addDamageText(ghost.x, ghost.y, player.damage, 'damage');

                if (newHealth <= 0) {
                  const baseExp = 15;
                  const phaseMultiplier = 1 + (phase - 1) * 0.3;
                  const expGained = Math.floor(baseExp * phaseMultiplier);

                  setScore(s => s + 10);
                  addDamageText(ghost.x, ghost.y - 15, `+${expGained} EXP`, 'exp');
                  addDamageText(ghost.x, ghost.y - 30, 'KILL!', 'kill');

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
                  addDamageText(ghost.x, ghost.y - 15, `${newHealth}/${ghostMaxHealth}`, 'health');
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

      // Player projectile collisions with boss
      setProjectiles(prev => {
        const remaining = [];
        prev.forEach(proj => {
          if (Math.abs(boss.x - proj.x) < 35 && Math.abs(boss.y - proj.y) < 35) {
            setBoss(prevBoss => {
              const newHealth = Math.max(0, prevBoss.health - player.damage);

              addDamageText(boss.x, boss.y, player.damage, 'damage');
              addDamageText(boss.x, boss.y - 15, `${newHealth}/${prevBoss.maxHealth}`, 'health');

              if (prevBoss.health > 0 && newHealth === 0) {
                const bossExp = 100;
                addDamageText(boss.x, boss.y - 30, `+${bossExp} EXP`, 'exp');
                addDamageText(boss.x, boss.y - 45, 'BOSS KILLED!', 'kill');

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

      // Boss projectile collisions with player
      setBossProjectiles(prev => {
        const remaining = [];
        prev.forEach(proj => {
          if (Math.abs(player.x - proj.x) < 25 && Math.abs(player.y - proj.y) < 25) {
            setPlayer(prevPlayer => {
              const newHealth = Math.max(0, prevPlayer.health - 10);
              addDamageText(player.x, player.y, 10, 'damage');
              if (newHealth <= 0) {
                setGameState('gameOver');
              }
              return { ...prevPlayer, health: newHealth };
            });
          } else {
            remaining.push(proj);
          }
        });
        return remaining;
      });

      // Check game over
      if (player.health <= 0) {
        setGameState('gameOver');
      }

      // Check victory
      if (boss.health <= 0) {
        setPhase(prev => prev + 1);
        setBoss(prev => ({
          ...prev,
          health: prev.maxHealth * 2,
          maxHealth: prev.maxHealth * 2,
          x: gameWidth / 2,
          y: 120
        }));

        const newGhosts = [];
        const ghostMaxHealth = Math.floor(10 * Math.pow(1.5, phase - 1));

        for (let i = 0; i < 10 + phase; i++) {
          newGhosts.push({
            id: Date.now() + i,
            x: Math.random() * (gameWidth - 100) + 50,
            y: Math.random() * 200 + 50,
            vx: (Math.random() - 0.5) * (1.5 + phase * 0.3),
            vy: (Math.random() - 0.5) * (1.5 + phase * 0.3),
            health: ghostMaxHealth
          });
        }
        setGhosts(newGhosts);
      }
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameState, player, boss, lastShot, ghosts.length, phase, experienceToNext, isMoving, moveDirection]);

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
      x: gameWidth / 2,
      y: 400,
      health: 100,
      maxHealth: 100,
      fireRate: 500,
      damage: 8,
      projectileCount: 1
    });
    setBoss({ x: gameWidth / 2, y: 120, health: 100, maxHealth: 100 });
    setProjectiles([]);
    setBossProjectiles([]);
    setDamageTexts([]);
    damageTextIdRef.current = 0;

    const initialGhosts = [];
    for (let i = 0; i < 10; i++) {
      initialGhosts.push({
        id: i,
        x: Math.random() * (gameWidth - 100) + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        health: 10
      });
    }
    setGhosts(initialGhosts);
  };

  const startGame = () => {
    console.log('Starting game!'); // Debug
    setGameState('playing');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      color: 'white',
      backgroundColor: '#1a202c',
      borderRadius: '15px',
      padding: '15px',
      minHeight: '100vh',
      maxWidth: '400px',
      margin: '0 auto',
      userSelect: 'none'
    }}>
      {/* Interface controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={togglePause}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ⏸️
          </button>

          <div style={{
            backgroundColor: '#dc2626',
            padding: '6px 16px',
            borderRadius: '8px',
            border: '2px solid #ef4444',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            CARTÃO CHEFE
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>🏆</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{score}</span>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'black',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>FASE {phase}</span>
          <span style={{ color: '#fbbf24' }}>NÍVEL {level}</span>
          <span style={{ color: '#10b981' }}>EXP: +{Math.floor(15 * (1 + (phase - 1) * 0.3))}</span>
        </div>
      </div>

      {/* Experience bar */}
      <div style={{
        width: '280px',
        height: '12px',
        backgroundColor: '#374151',
        borderRadius: '6px',
        marginBottom: '12px',
        border: '1px solid #6b7280'
      }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
            borderRadius: '6px',
            transition: 'width 0.3s',
            width: `${(experience / experienceToNext) * 100}%`
          }}
        />
        <div style={{
          fontSize: '10px',
          textAlign: 'center',
          color: 'white',
          marginTop: '-10px'
        }}>
          {experience}/{experienceToNext}
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        style={{
          position: 'relative',
          backgroundColor: '#374151',
          border: '3px solid #6b7280',
          overflow: 'hidden',
          width: `${gameWidth}px`,
          height: `${gameHeight}px`,
          cursor: gameState === 'instructions' ? 'pointer' : 'default',
          touchAction: 'none'
        }}
        // Touch events
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // Mouse events (fallback)
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Game entities */}
        {gameState !== 'instructions' && ghosts.map(ghost => (
          <div
            key={ghost.id}
            style={{
              position: 'absolute',
              fontSize: '20px',
              left: ghost.x - 12,
              top: ghost.y - 12,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            📄
            <div style={{ width: '20px', height: '3px', backgroundColor: '#7f1d1d', borderRadius: '1px', marginTop: '3px' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '1px',
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
              left: boss.x - 24,
              top: boss.y - 24,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '36px' }}>💳</div>
            <div style={{ width: '48px', height: '6px', backgroundColor: '#7f1d1d', borderRadius: '3px', marginTop: '3px' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '3px',
                  transition: 'width 0.3s',
                  width: `${(boss.health / boss.maxHealth) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Player */}
        {gameState !== 'instructions' && (
          <div
            style={{
              position: 'absolute',
              left: player.x - 16,
              top: player.y - 16,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              🤵💼
            </div>
            <div style={{ width: '36px', height: '6px', backgroundColor: '#7f1d1d', borderRadius: '3px', marginTop: '3px' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '3px',
                  transition: 'width 0.3s',
                  width: `${(player.health / player.maxHealth) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Projectiles */}
        {gameState !== 'instructions' && projectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              fontSize: '12px',
              left: proj.x - 6,
              top: proj.y - 6,
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none'
            }}
          >
            💸
          </div>
        ))}

        {/* Boss projectiles */}
        {gameState !== 'instructions' && bossProjectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              fontSize: '12px',
              color: '#dc2626',
              fontWeight: 'bold',
              left: proj.x - 6,
              top: proj.y - 6,
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none'
            }}
          >
            ✖
          </div>
        ))}

        {/* Damage texts */}
        {gameState !== 'instructions' && damageTexts.map(text => (
          <div
            key={text.id}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              fontWeight: 'bold',
              fontSize: text.type === 'kill' ? '12px' : '10px',
              left: text.x,
              top: text.y + text.offsetY,
              opacity: text.opacity,
              color: text.type === 'damage' ? '#ff4444' :
                     text.type === 'exp' ? '#ffdd44' :
                     text.type === 'kill' ? '#44ff44' :
                     '#ffffff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.05s ease-out'
            }}
          >
            {text.type === 'damage' ? `-${text.damage}` :
             text.type === 'health' ? text.damage :
             text.damage}
          </div>
        ))}

        {/* Instructions overlay */}
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
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#fbbf24' }}>
              🤵💼 BATALHA FINANCEIRA 💳📄
            </div>
            <div style={{
              fontSize: '16px',
              marginBottom: '20px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #3b82f6'
            }}>
              Toque e arraste para mover • Tiro automático
            </div>
            <div style={{
              fontSize: '18px',
              color: '#10b981',
              fontWeight: 'bold',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '2px solid #10b981'
            }}>
              TOQUE AQUI PARA COMEÇAR!
            </div>
          </div>
        )}

        {/* Level up overlay */}
        {gameState === 'levelUp' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1000
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: '#fbbf24' }}>PROMOÇÃO!</div>
            <div style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>Escolha seu upgrade:</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button
                onClick={() => selectUpgrade('fireRate')}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (player.fireRate > 100) {
                    selectUpgrade('fireRate');
                  }
                }}
                disabled={player.fireRate <= 100}
                style={{
                  backgroundColor: player.fireRate <= 100 ? '#6b7280' : '#2563eb',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: player.fireRate <= 100 ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  minHeight: '60px'
                }}
              >
                ⚡ Agilidade Financeira
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                  {player.fireRate <= 100 ? 'MAX' : `${player.fireRate}ms → ${Math.max(100, player.fireRate - 100)}ms`}
                </div>
              </button>

              <button
                onClick={() => selectUpgrade('projectileCount')}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (player.projectileCount < 5) {
                    selectUpgrade('projectileCount');
                  }
                }}
                disabled={player.projectileCount >= 5}
                style={{
                  backgroundColor: player.projectileCount >= 5 ? '#6b7280' : '#059669',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: player.projectileCount >= 5 ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  minHeight: '60px'
                }}
              >
                🎯 Múltiplas Rendas
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                  {player.projectileCount >= 5 ? 'MÁXIMO' : `${player.projectileCount} → ${player.projectileCount + 1} projéteis`}
                </div>
              </button>

              <button
                onClick={() => selectUpgrade('damage')}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  selectUpgrade('damage');
                }}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minHeight: '60px'
                }}
              >
                💼 Poder de Negociação
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                  {player.damage} → {player.damage + 4} de dano
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {gameState === 'paused' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>PAUSADO</div>
          </div>
        )}

        {/* Game over overlay */}
        {gameState === 'gameOver' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center',
              zIndex: 1000
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: '#ef4444' }}>FALÊNCIA!</div>
            <div style={{ fontSize: '16px', marginBottom: '6px' }}>Capital Final: {score}</div>
            <div style={{ fontSize: '14px', marginBottom: '6px', color: '#fbbf24' }}>Fase: {phase}</div>
            <div style={{ fontSize: '14px', marginBottom: '12px', color: '#10b981' }}>Nível: {level}</div>
            <button
              onClick={resetGame}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                resetGame();
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                minHeight: '50px'
              }}
            >
              NOVO NEGÓCIO
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls info */}
      <div style={{
        marginTop: '12px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        <p>Toque e arraste para mover • Tiro automático!</p>
        <p>Derrote o cartão-chefe para avançar!</p>
      </div>

      {/* Mobile stats */}
      <div style={{
        marginTop: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        fontSize: '11px',
        width: '100%',
        maxWidth: '300px'
      }}>
        <span>Boletos: {ghosts.length}</span>
        <span>Cartão: {boss.health}/{boss.maxHealth}</span>
        <span>Saúde: {player.health}/{player.maxHealth}</span>
        <span>Rendas: {player.projectileCount}</span>
        <span>Dano: {player.damage}</span>
        <span>Vel: {player.fireRate}ms</span>
      </div>

      {/* Debug info - remove in production */}
      <div style={{
        marginTop: '8px',
        fontSize: '10px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Estado: {gameState} | Movendo: {isMoving ? 'Sim' : 'Não'}
      </div>
    </div>
  );
};

export default GhostBossGameMobile;