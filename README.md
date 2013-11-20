## Ember Canary Builder

This is a Node.js-based web service that will build custom
versions of Ember Canary stripped of feature flags. 

This is intended to be used with a front-end tool that
will allow you to select desired feature flags and 
eventually route you to a url to this service where you
can download the custom Ember.js build.

### Example:

[Ember Canary from 11/14/2013 with propertyBraceExpansion enabled](http://ember-canary-builder.herokuapp.com/canary/daily/20131114/ember.js?propertyBraceExpansion=true)

Note that the source Ember.js file that is use is pulled
right off of [http://builds.emberjs.com/](http://builds.emberjs.com/)
with the same URL path. Also, the starting point features.json
that is used is the one on GitHub master.

### TODO

- Add tests
- Clearing ember-latest.js cache every so often

