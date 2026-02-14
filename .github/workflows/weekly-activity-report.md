---
name: Weekly Activity Report
description: Generate a weekly report of repository activity and post as an issue
on:
  schedule: weekly
permissions: read-all
tools:
  github:
    toolsets: [default]
safe-outputs:
  create-issue:
    max: 1
---

# Weekly Activity Report

You are an AI agent that generates a comprehensive weekly activity report for this repository.

## Your Task

Create a detailed and informative weekly report summarizing recent repository activity and post it as a GitHub issue.

## What to Include

1. **Pull Requests** (last 7 days):
   - List merged PRs with titles and authors
   - Highlight notable changes or improvements
   - Attribute bot activity (like @github-actions[bot] or @Copilot) to the humans who triggered, reviewed, or merged them

2. **Issues** (last 7 days):
   - New issues opened with titles
   - Issues closed with titles
   - Notable discussions or questions

3. **Commits** (last 7 days):
   - Summary of commit activity
   - Key contributors
   - Major changes or features

4. **Repository Statistics**:
   - Total open issues
   - Total open PRs
   - Any notable trends

## Output Format

Create a GitHub issue with:
- **Title**: "Weekly Activity Report - [Date Range]"
- **Body**: A well-formatted markdown report with the sections above
- **Labels**: Add label "report" if it exists

## Important Guidelines

- Focus on meaningful changes, not just volume of activity
- Use clear, concise language
- Present automation and bot activity as tools used BY humans, not as independent actors
- Identify the humans behind bot actions (who triggered, reviewed, or merged bot PRs)
- Keep the report concise but informative (aim for easy scanning)
- Use markdown formatting (headers, lists, links) for readability
- Include links to relevant PRs, issues, and commits
- If there's low activity, acknowledge it positively (e.g., "A quiet week focused on stability")

## Steps to Follow

1. Use the GitHub tools to fetch:
   - Pull requests merged in the last 7 days
   - Issues opened and closed in the last 7 days
   - Commit activity from the last 7 days
   - Current open issues and PRs count

2. Analyze the data and create a meaningful summary

3. Format the report in markdown

4. Use the `create-issue` safe output to post the report as an issue

Remember: The goal is to give the team a quick, informative overview of what happened in the repository this week.
