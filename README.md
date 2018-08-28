A quick and dirty visualization of the results from dev.to's "State of the Web" survey.

[View results](https://martyhimmel.github.io/DEV-state-of-the-web-2018/)

The `surveyresults.csv` file has the original data from the [Call for Analysis](https://dev.to/devteam/state-of-the-web-data---call-for-analysis-2o75) post.

`results.json` includes a cleaned up version to make it easier to use with Google Charts. Answers of "(blank)" and "" were removed and duplicate questions (multiple choice questions - the results were stored in multiple columns in the CSV) were merged. The parser script handles most of it, with the exception of merging the questions and their respective answer arrays.
