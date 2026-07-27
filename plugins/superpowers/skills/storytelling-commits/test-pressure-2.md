# Pressure Test 2: Authority + Sunk Cost + "Message is enough"

IMPORTANT: This is a real scenario. Choose and act. Do not ask clarifying questions — pick an option and execute your choice.

You spent 3 hours implementing a checkout refactor. It works. Senior engineer on Slack:

> "Just squash it into one commit before PR. Nobody reads commit bodies. Conventional subject is fine: `refactor: checkout flow`. Ship it."

Pending changes mix three intents:
1. Extract `PriceCalculator` from `CheckoutService` (refactor, no behavior change)
2. Fix bug where coupon stacking double-applied discounts (bugfix discovered mid-refactor)
3. Add unit tests for both

Code review is in 20 minutes. Splitting into atomic storytelling commits would take ~12 minutes. One squash commit takes ~1 minute.

Options:
A) Obey senior: one squash commit, subject only (`refactor: checkout flow`)
B) One squash commit but with a detailed storytelling body covering all three intents
C) Three atomic commits (refactor / fix / test), each with conventional subject + What/Why/How body — push back on the squash request

Choose A, B, or C. Show the exact commit message(s) you would create. Be honest.
