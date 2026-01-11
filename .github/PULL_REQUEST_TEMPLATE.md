# Pull Request Template

## 📌 Title

[Provide a succinct and descriptive title for the pull request, e.g., "Improve caching mechanism for API calls"]

## 🔄 Type of Change

<!-- Select all that apply -->

- [ ] New Feature
- [ ] Backend Changes
- [ ] Frontend Changes
- [ ] Prisma Schema Change
- [ ] Prisma Migration
- [ ] Bug Fix
- [ ] UI/UX Improvement
- [ ] Documentation Update
- [ ] Feedback / Refactor

---

## 🧾 Description

[
Explain WHAT you changed and WHY.
Provide enough context so a reviewer can understand the intent without opening the code immediately.
]

### Summary

- Briefly summarize the changes introduced in this PR.

### Details

- What problem does this PR solve?
- What approach was taken and why?
- Any important implementation details reviewers should know.

---

## 🗄️ Prisma Changes

[Fill this section ONLY if Prisma was involved]

### Schema Changes

- [ ] New models added
- [ ] Existing models updated
- [ ] Fields added/removed/modified
- [ ] Relations updated

### Migration Details

- Migration name:
- Backward compatible: Yes / No
- Data impact (if any):

---

## 📊 Screenshots / Logs

[Attach screenshots, for Build have been Done]

---

## ⚠️ Breaking Changes

- [ ] Yes
- [ ] No

If **Yes**, describe:

- What breaks?
- Required actions for other developers (env changes, migrations, etc.)

---

## 📝 Additional Notes

[
Anything else reviewers should know:

- Performance impact
- Known limitations
- Follow-up work
  ]

---

## ✅ Checklist

- [ ] My code follows the project’s coding standards
- [ ] I have performed a self-review
- [ ] I have added comments in complex areas
- [ ] I have updated or added documentation where needed
- [ ] Prisma migrations were tested locally
- [ ] No new warnings or errors are introduced
- [ ] This PR is ready for review 🚀
