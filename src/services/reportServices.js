import http from './httpService';
const apiUrl = sessionStorage.getItem('apiUrl');
const mode = sessionStorage.getItem('mode');

export function getWaterfallReport(
  projectID,
  subjectUIDs,
  pairs,
  type = 'BASELINE',
  metric = 'RECIST',
) {
  const url = `${apiUrl}/reports/waterfall?type=${type}&metric=${metric}`;
  const body = pairs
    ? { pairs }
    :  projectID && subjectUIDs
    ? { projectID, subjectUIDs }
    : { projectID };
  return http.post(url, body);
}

// updates waterfall paths to work from POST on /reports/waterfall. type and metric are still passed in query.
// the body should be an object with following fields
// {projectID: .., subjectUIDs=[...], pairs: [{subjectUID:..., projectID:...}, ....]}.
// Sending only projectID gets all patients in that project.
// projectID and subjectUIDs array gets multiple patients from the same project.
// pairs can be used to pass projectID,subjectUID pairs

// Project Reporting Tests in projectTest.js have samples

// project: .post('/reports/waterfall?type=BASELINE&metric=RECIST')
//         .send({ projectID: 'reporting' })

// project adla .post('/reports/waterfall?type=BASELINE&metric=ADLA')
//         .send({ projectID: 'reporting' })

// multiple patient from one project:

// .post('/reports/waterfall?type=BASELINE&metric=RECIST')
//         .send({ projectID: 'reporting', subjectUIDs: ['7'] })

// ADLA:

// .post('/reports/waterfall?type=BASELINE&metric=ADLA')
//         .send({ projectID: 'reporting', subjectUIDs: ['7'] })

// from worklist: project/subject pairs

//  .post('/reports/waterfall?type=BASELINE&metric=RECIST')
//         .send({ pairs: [{ subjectID: '7', projectID: 'reporting' }] })

// .post('/reports/waterfall?type=BASELINE&metric=ADLA')
//         .send({ pairs: [{ subjectID: '7', projectID: 'reporting' }] })

// changes pushed

// afiyet olsun
