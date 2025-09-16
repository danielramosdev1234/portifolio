"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

const GhostBossGame = () => {
  const [gameState, setGameState] = useState('playing'); // 'playing', 'paused', 'gameOver', 'levelUp'
  const [score, setScore] = useState(1291);
  const [phase, setPhase] = useState(1);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [experienceToNext, setExperienceToNext] = useState(100);
  const [player, setPlayer] = useState({
    x: 350,
    y: 500,
    health: 100,
    maxHealth: 100, // HP máximo inicial
    fireRate: 500, // ms entre tiros
    damage: 8,
    projectileCount: 1 // Número de projéteis (máximo 5)
  });
  const [boss, setBoss] = useState({ x: 350, y: 150, health: 100, maxHealth: 100 });
  const [ghosts, setGhosts] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const [keys, setKeys] = useState({});
  const [lastShot, setLastShot] = useState(0);
  const [damageTexts, setDamageTexts] = useState([]); // Para mostrar os números de dano

  // Use a ref to keep track of unique IDs
  const damageTextIdRef = useRef(0);

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
        health: 10 // HP inicial dos fantasmas
      });
    }
    setGhosts(initialGhosts);
  }, []);

  // Função para adicionar texto de dano
  const addDamageText = (x, y, damage, type = 'damage') => {
    // Generate truly unique ID using ref counter
    damageTextIdRef.current += 1;
    const newDamageText = {
      id: `damage_${damageTextIdRef.current}_${Date.now()}`,
      x: x,
      y: y,
      damage: damage,
      type: type, // 'damage', 'exp', 'kill'
      opacity: 1,
      offsetY: 0
    };

    setDamageTexts(prev => [...prev, newDamageText]);

    // Remove o texto após animação
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

  // Loop principal do jogo - OTIMIZADO
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Movimento do jogador
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys['ArrowLeft'] || keys['a']) newX = Math.max(20, prev.x - 5);
        if (keys['ArrowRight'] || keys['d']) newX = Math.min(680, prev.x + 5);
        if (keys['ArrowUp'] || keys['w']) newY = Math.max(350, prev.y - 5);
        if (keys['ArrowDown'] || keys['s']) newY = Math.min(580, prev.y + 5);

        return { ...prev, x: newX, y: newY };
      });

      // Tiro mágico automático do jogador
      const now = Date.now();
      if (now - lastShot > player.fireRate) {
        const newProjectiles = [];

        // Calcular posições e velocidades dos projéteis
        if (player.projectileCount === 1) {
          // 1 projétil - centro
          newProjectiles.push({
            id: `proj_${now}_0`,
            x: player.x,
            y: player.y - 30,
            vx: 0,
            vy: -6,
            type: 'player'
          });
        } else if (player.projectileCount === 2) {
          // 2 projéteis - esquerda e direita
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
          // 3 projéteis - centro, esquerda e direita
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
          // 4 projéteis - dois pares
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
          // 5 projéteis - máximo
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

                // Mostrar dano
                addDamageText(ghost.x, ghost.y, player.damage, 'damage');

                if (newHealth <= 0) {
                  // Fantasma morreu
                  const baseExp = 15;
                  const phaseMultiplier = 1 + (phase - 1) * 0.3; // 30% mais exp por fase
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

                  return null; // Remove fantasma
                } else {
                  // Fantasma ainda vivo, mostrar HP restante
                  const ghostMaxHealth = Math.floor(10 * Math.pow(1.5, phase - 1));
                  addDamageText(ghost.x, ghost.y - 20, `${newHealth}/${ghostMaxHealth}`, 'health');
                  return { ...ghost, health: newHealth };
                }
              }
              return ghost;
            }).filter(Boolean); // Remove fantasmas mortos (null)
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

              // Mostrar dano no boss
              addDamageText(boss.x, boss.y, player.damage, 'damage');
              addDamageText(boss.x, boss.y - 20, `${newHealth}/${prevBoss.maxHealth}`, 'health');

              // Só ganha experiência quando o boss morre
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

      // Verificar vitória (apenas boss morto)
      if (boss.health <= 0) {
        // Avançar para próxima fase
        setPhase(prev => prev + 1);

        // Resetar para próxima fase - dobrar HP do boss
        setBoss(prev => ({
          ...prev,
          health: prev.maxHealth * 2,
          maxHealth: prev.maxHealth * 2,
          x: 350,
          y: 150
        }));

        // Gerar novos fantasmas com HP baseado na fase (10 * 1.5^(fase-1))
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
  }, [gameState, keys, player, boss, lastShot, ghosts.length, phase, experienceToNext]);

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

      // Ganhar 2 HP máximo e recuperar 5 HP a cada nível
      updatedPlayer.maxHealth = prev.maxHealth + 2;
      updatedPlayer.health = Math.min(updatedPlayer.maxHealth, prev.health + 5);

      return updatedPlayer;
    });

    // Aumentar nível e experiência necessária em 10%
    setLevel(prev => prev + 1);
    setExperienceToNext(prev => Math.floor(prev * 1.1));

    setGameState('playing');
  };

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const resetGame = () => {
    setGameState('playing');
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

    // Reset the damage text ID counter
    damageTextIdRef.current = 0;

    const initialGhosts = [];
    for (let i = 0; i < 15; i++) {
      initialGhosts.push({
        id: i,
        x: Math.random() * 650 + 50,
        y: Math.random() * 300 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        health: 10 // HP inicial
      });
    }
    setGhosts(initialGhosts);
  };

  // MUDANÇA PRINCIPAL: Container adaptado para o MainLayout
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      color: 'white',
      backgroundColor: '#1a202c',
      borderRadius: '20px',
      padding: '20px',
      minHeight: '80vh'
    }}>
      {/* Interface superior */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <button
          onClick={togglePause}
          style={{
            backgroundColor: '#3182ce',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2c5aa0'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3182ce'}
        >
          ⏸️
        </button>

        <div style={{
          backgroundColor: '#dc2626',
          padding: '8px 24px',
          borderRadius: '8px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>CHEFE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>👻</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{score}</span>
          <span style={{ fontSize: '24px' }}>🪙</span>
        </div>
      </div>

      <div style={{
        backgroundColor: 'black',
        padding: '8px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span>FASE {phase}</span>
        <span style={{ color: '#fbbf24' }}>NÍVEL {level}</span>
        <span style={{ color: '#10b981' }}>EXP Fantasma: +{Math.floor(15 * (1 + (phase - 1) * 0.3))}</span>
      </div>

      {/* Barra de Experiência */}
      <div style={{
        width: '320px',
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
          width: '700px',
          height: '600px'
        }}
      >
        {/* Fantasmas */}
        {ghosts.map(ghost => (
          <div
            key={ghost.id}
            style={{
              position: 'absolute',
              fontSize: '24px',
              left: ghost.x - 15,
              top: ghost.y - 15,
              transform: 'translate(-50%, -50%)'
            }}
          >
            👻
            {/* Barra de vida do fantasma */}
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

        {/* Boss - só aparece se tiver vida */}
        {boss.health > 0 && (
          <div
            style={{
              position: 'absolute',
              left: boss.x - 30,
              top: boss.y - 30,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div style={{ fontSize: '48px' }}>👻</div>
            {/* Barra de vida do boss */}
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
        <div
          style={{
            position: 'absolute',
            left: player.x - 20,
            top: player.y - 20,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div style={{ fontSize: '32px' }}>🧙‍♂️</div>
          {/* Barra de vida do jogador */}
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

        {/* Projéteis do jogador */}
        {projectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: '#22d3ee',
              borderRadius: '50%',
              left: proj.x - 4,
              top: proj.y - 4
            }}
          />
        ))}

        {/* Projéteis do boss */}
        {bossProjectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: '#a855f7',
              borderRadius: '50%',
              left: proj.x - 4,
              top: proj.y - 4
            }}
          />
        ))}

        {/* Textos de dano flutuantes */}
        {damageTexts.map(text => (
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

        {/* Overlay de level up */}
        {gameState === 'levelUp' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', color: '#fbbf24' }}>LEVEL UP!</div>
            <div style={{ fontSize: '20px', marginBottom: '32px', textAlign: 'center' }}>Escolha um upgrade:</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => selectUpgrade('fireRate')}
                disabled={player.fireRate <= 100}
                style={{
                  backgroundColor: player.fireRate <= 100 ? '#6b7280' : '#2563eb',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '18px',
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
                ⚡ Velocidade de Tiro
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
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '18px',
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
                🎯 +1 Projétil
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {player.projectileCount >= 5 ? 'MÁXIMO ATINGIDO' : `${player.projectileCount} → ${player.projectileCount + 1} projéteis`}
                </div>
              </button>

              <button
                onClick={() => selectUpgrade('damage')}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                💥 Aumentar Dano
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
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>PAUSADO</div>
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
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>GAME OVER</div>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>Pontuação Final: {score}</div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#fbbf24' }}>Fase Alcançada: {phase}</div>
            <div style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Nível Alcançado: {level}</div>
            <button
              onClick={resetGame}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '20px',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              JOGAR NOVAMENTE
            </button>
          </div>
        )}
      </div>

      {/* Controles */}
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#9ca3af'
      }}>
        <p>Use WASD ou setas para mover • Tiro automático!</p>
        <p>Derrote apenas o chefe para avançar de fase!</p>
      </div>

      {/* Stats do jogador */}
      <div style={{
        marginTop: '8px',
        display: 'flex',
        gap: '16px',
        fontSize: '14px'
      }}>
        <span>Fantasmas: {ghosts.length}</span>
        <span>Boss: {boss.health}/{boss.maxHealth}</span>
        <span>Vida: {player.health}/{player.maxHealth}</span>
        <span>Projéteis: {player.projectileCount}</span>
        <span>Dano: {player.damage}</span>
        <span>Vel.Tiro: {player.fireRate}ms</span>
      </div>
    </div>
  );
};

export default GhostBossGame;