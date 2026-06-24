"use client";

import { Mail, Linkedin } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
};

export function TeamGrid({ team }: { team: TeamMember[] }) {
  if (!team || team.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="aspect-square rounded-2xl bg-ink-800 mb-4 flex items-center justify-center text-4xl font-serif text-gold-400">
              A
            </div>
            <p className="font-medium">Leadership {i}</p>
            <p className="text-xs text-ink-400">Role</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {team.map((member) => (
        <div key={member.id} className="text-center group">
          <div className="aspect-square rounded-2xl bg-ink-800 mb-4 overflow-hidden relative">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-gold-400">
                {member.name[0]}
              </div>
            )}
          </div>
          <p className="font-serif text-lg">{member.name}</p>
          <p className="text-xs text-gold-400 uppercase tracking-widest font-mono mb-1">
            {member.role}
          </p>
          {member.bio && (
            <p className="text-xs text-ink-400 mt-2 line-clamp-2">{member.bio}</p>
          )}
          {(member.email || member.linkedinUrl) && (
            <div className="flex items-center justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="text-ink-400 hover:text-gold-400"
                  aria-label={`Email ${member.name}`}
                >
                  <Mail size={14} />
                </a>
              )}
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-400 hover:text-gold-400"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <Linkedin size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}