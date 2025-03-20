const duration = 15;

export const toRight = {
  animate: {
    x: [0, 10, 10, 0, 0],
    y: [0, 0, 10, 10, 0]
  },
  transition: {
    duration,
    ease: "linear",
    repeat: Infinity
  }
};

export const toBottom = {
  animate: {
    x: [0, 0, -10, -10, 0],
    y: [0, 10, 10, 0, 0]
  },
  transition: {
    duration,
    ease: "linear",
    repeat: Infinity
  }
};

export const toLeft = {
  animate: {
    x: [0, -10, -10, 0, 0],
    y: [0, 0, 10, 10, 0]
  },
  transition: {
    duration,
    ease: "linear",
    repeat: Infinity
  }
};

export const toUp = {
  animate: {
    x: [0, 0, 10, 10, 0],
    y: [0, 10, 10, 0, 0]
  },
  transition: {
    duration,
    ease: "linear",
    repeat: Infinity
  }
};
