// Veri modelini netleştiriyoruz
export const MatchResult = {
  WIN: 'Win',
  LOSS: 'Loss',
  DRAW: 'Draw'
};

export const INITIAL_MATCH = {
  id: '',
  opponentName: '',
  opponentElo: 2000,
  myResult: MatchResult.WIN,
  openingPlayed: '',
  date: ''
};