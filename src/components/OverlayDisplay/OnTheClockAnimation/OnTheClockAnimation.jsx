import React from 'react';
import { motion } from 'framer-motion';
import styles from './OnTheClockAnimation.module.css';

const OnTheClockAnimation = ({ team, onComplete }) => {
  if (!team) return null;

  // CSS variables for team colors
  const style = {
    '--team-primary': team.colors[0],
    '--team-secondary': team.colors[1]
  };

  return (
    <motion.div 
      className={styles.animationContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={style}
    >
      <div className={styles.accentBars}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.bar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ 
              delay: 0.2 + (i * 0.1),
              duration: 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <motion.div 
        className={styles.content}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img 
          src={team.logo}
          alt={`${team.name} logo`}
          className={styles.teamLogo}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <motion.div 
          className={styles.teamName}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {team.name}
        </motion.div>
        <motion.div 
          className={styles.onClockText}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          IS NOW ON THE CLOCK
        </motion.div>
      </motion.div>

      {/* Auto-dismiss trigger */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 6 }}
        onAnimationComplete={onComplete}
      />
    </motion.div>
  );
};

export default OnTheClockAnimation;
