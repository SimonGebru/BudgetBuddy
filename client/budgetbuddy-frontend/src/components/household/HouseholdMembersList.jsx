import { Users } from "lucide-react";

export function HouseholdMembersList({
  members,
  selectedMonth,
  currentUser,
}) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">
          Members ({selectedMonth})
        </h3>
      </div>

      <div className="space-y-3">
        {members.map((member) => {
          const isMe = Boolean(
            currentUser && String(member.userId) === String(currentUser.id)
          );

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between rounded-xl bg-muted/40 p-4"
            >
              <div>
                <p className="font-medium text-foreground">
                  {member.name} {isMe ? "(You)" : ""}
                </p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Income for {selectedMonth}
                </p>
                <p className="font-semibold text-foreground">
                  {member.displayedIncome} SEK
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}