# Security Specification: ABBA Bible Study App

## 1. Data Invariants
- `UserStats`: A user can only access and modify their own stats. Stats must have valid types and non-negative points/streak.
- `ReadingProgress`: A user can only record their own progress. Once record, it is immutable (cannot be changed or deleted by the user).
- `SavedNote`: A user can only access and modify their own notes. Notes must have a valid Bible reference string.

## 2. The Dirty Dozen Payloads
1. **Identity Spoofing (Stats)**: `{ "userId": "someone_else_id", "points": 9999 }` sent to `/users/my_id`.
2. **Resource Poisoning (Stats)**: `{ "points": "infinity", "rank": "God Mode" }` sent to `/users/my_id`.
3. **State Shortcutting (Progress)**: Setting `completedAt` to a future date instead of `request.time`.
4. **Orphaned Write (Progress)**: Creating progress for a book that doesn't exist (not easily verifiable without a list of books, but we check ID validity).
5. **Unauthorized Access (Notes)**: Reading `/notes/someone_else_id/userNotes/some_note`.
6. **Malicious ID injection**: Injecting a 1MB string as a `progressId`.
7. **Privilege Escalation**: Attempting to set `isAdmin: true` in `UserStats` (though we don't have an admin field, we should block unknown fields).
8. **Shadow Field Injection**: Adding an `isVerified: true` field to a note.
9. **Spam Notes**: Sending a massive 1MB string in the `content` field.
10. **Immutability Breach**: Attempting to update a ReadingProgress record.
11. **Timestamp Spoofing**: Sending client-side `createdAt` in notes.
12. **Query Scraping**: Attempting to list all users' notes with a wildcard query.

## 3. Test Runner (Draft)
The tests will verify:
- `get` on private data fails for non-owners.
- `create` with invalid schema fails.
- `update` with immutable fields fails.
- `delete` on progress fails.
