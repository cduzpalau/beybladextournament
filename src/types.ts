export type Participant = {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  age: number;
};

export type MatchScore = {
  p1Points: number;
  p2Points: number;
  p1Sets: number;
  p2Sets: number;
};

export type Match = {
  id: string;
  p1Id: string;
  p2Id: string;
  score: MatchScore;
  winnerId?: string;
  status: 'pending' | 'finished';
  stage: 'group' | 'knockout';
  groupId?: string;
  round?: number;
};

export type Group = {
  id: string;
  name: string;
  participantIds: string[];
};

export type GroupStanding = {
  participantId: string;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  pointsWon: number;
  pointsLost: number;
  points: number;
};

export type Tournament = {
  id: string;
  title: string;
  participants: Participant[];
  groups: Group[];
  matches: Match[];
  status: 'setup' | 'group_stage' | 'brackets' | 'finished';
};
