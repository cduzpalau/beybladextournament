import type { Tournament, Participant, Group, Match, GroupStanding } from './types';

export const calculateStandings = (tournament: Tournament, groupId: string): GroupStanding[] => {
  const group = tournament.groups.find(g => g.id === groupId);
  if (!group) return [];

  const standings: Record<string, GroupStanding> = {};
  group.participantIds.forEach(id => {
    standings[id] = {
      participantId: id,
      played: 0,
      won: 0,
      lost: 0,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
      points: 0
    };
  });

  const groupMatches = tournament.matches.filter(m => m.groupId === groupId && m.status === 'finished');

  groupMatches.forEach(match => {
    const p1 = standings[match.p1Id];
    const p2 = standings[match.p2Id];

    p1.played++;
    p2.played++;

    p1.setsWon += match.score.p1Sets;
    p1.setsLost += match.score.p2Sets;
    p2.setsWon += match.score.p2Sets;
    p2.setsLost += match.score.p1Sets;

    p1.pointsWon += match.score.p1Points;
    p1.pointsLost += match.score.p2Points;
    p2.pointsWon += match.score.p2Points;
    p2.pointsLost += match.score.p1Points;

    if (match.winnerId === match.p1Id) {
      p1.won++;
      p1.points += 3;
      p2.lost++;
    } else {
      p2.won++;
      p2.points += 3;
      p1.lost++;
    }
  });

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if ((b.setsWon - b.setsLost) !== (a.setsWon - a.setsLost)) 
      return (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
    return (b.pointsWon - b.pointsLost) - (a.pointsWon - a.pointsLost);
  });
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateTournament = (title: string, participants: Participant[]): Tournament => {
  const shuffled = shuffleArray(participants);
  const numGroups = 3;
  const playersPerGroup = 4;
  
  const groups: Group[] = [];
  const matches: Match[] = [];

  for (let i = 0; i < numGroups; i++) {
    const groupId = `group_${String.fromCharCode(65 + i)}`;
    const groupParticipants = shuffled.slice(i * playersPerGroup, (i + 1) * playersPerGroup);
    
    groups.push({
      id: groupId,
      name: `Grup ${String.fromCharCode(65 + i)}`,
      participantIds: groupParticipants.map(p => p.id)
    });

    for (let j = 0; j < groupParticipants.length; j++) {
      for (let k = j + 1; k < groupParticipants.length; k++) {
        matches.push({
          id: `match_${groupId}_${j}_${k}`,
          p1Id: groupParticipants[j].id,
          p2Id: groupParticipants[k].id,
          score: { p1Points: 0, p2Points: 0, p1Sets: 0, p2Sets: 0 },
          status: 'pending',
          stage: 'group',
          groupId: groupId
        });
      }
    }
  }

  return {
    id: Date.now().toString(),
    title,
    participants,
    groups,
    matches,
    status: 'group_stage'
  };
};

export const generateBrackets = (tournament: Tournament): Tournament => {
  const allStandings: { groupId: string; standings: GroupStanding[] }[] = tournament.groups.map(g => ({
    groupId: g.id,
    standings: calculateStandings(tournament, g.id)
  }));

  const advanced: string[] = [];
  allStandings.forEach(g => {
    advanced.push(g.standings[0].participantId);
    advanced.push(g.standings[1].participantId);
  });

  const thirdPlaces = allStandings.map(g => g.standings[2]).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
  });
  
  advanced.push(thirdPlaces[0].participantId);
  advanced.push(thirdPlaces[1].participantId);

  const qfMatches: Match[] = [];
  for (let i = 0; i < 4; i++) {
    qfMatches.push({
      id: `match_qf_${i}`,
      p1Id: advanced[i],
      p2Id: advanced[7 - i],
      score: { p1Points: 0, p2Points: 0, p1Sets: 0, p2Sets: 0 },
      status: 'pending',
      stage: 'knockout',
      round: 1
    });
  }

  return {
    ...tournament,
    matches: [...tournament.matches, ...qfMatches],
    status: 'brackets'
  };
};

export const advanceKnockout = (tournament: Tournament): Tournament => {
  const currentMatches = tournament.matches.filter(m => m.stage === 'knockout');
  const knockoutRounds = currentMatches.map(m => m.round || 0);
  if (knockoutRounds.length === 0) return tournament;
  
  const maxRound = Math.max(...knockoutRounds);
  const roundMatches = currentMatches.filter(m => m.round === maxRound);
  const allFinished = roundMatches.every(m => m.status === 'finished');

  if (!allFinished) return tournament;

  const winners = roundMatches.map(m => m.winnerId!);
  
  if (winners.length === 1) {
    return { ...tournament, status: 'finished' };
  }

  const nextRoundMatches: Match[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    nextRoundMatches.push({
      id: `match_r${maxRound + 1}_${i / 2}`,
      p1Id: winners[i],
      p2Id: winners[i + 1],
      score: { p1Points: 0, p2Points: 0, p1Sets: 0, p2Sets: 0 },
      status: 'pending',
      stage: 'knockout',
      round: maxRound + 1
    });
  }

  return {
    ...tournament,
    matches: [...tournament.matches, ...nextRoundMatches]
  };
};
