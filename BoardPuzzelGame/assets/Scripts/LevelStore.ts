import { LEVEL_LIST } from "./LevelList";

class LevelStore {
  levels = LEVEL_LIST;
  currLevelIndex = 0;

  setCurrentLevel(index: number) {
    if (index < 0 || index >= this.levels.length) index = 0;
    this.currLevelIndex = index;
  }

  getCurrentLevelIndex(): number {
    return this.currLevelIndex;
  }

  getCurrentLevel() {
    return this.levels[this.currLevelIndex];
  }

  getLevelListLength(): number {
    return this.levels.length;
  }
}

export const LevelStoreInstance = new LevelStore();
