import 'jest'
import * as request from 'supertest'

const address: string = (<any>global).address
const auth: string = (<any>global).auth

describe('Test Users', function() {
  test('get /users', () => {
    return request(address)
      .get('/users')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.body.items).toBeInstanceOf(Array)
      }).catch(fail)
  })

  test('get /users/aaaa - Not found', () => {
    return request(address)
      .get('/users/aaaa')
      .then(response => {
        expect(response.status).toBe(404)
      }).catch(fail)
  })

  test('get /users/:id', () => {
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        name: 'User',
        email: 'user@gmail.com',
        password: '123456',
        cpf: '675.028.852-93'
      }).then(response => request(address)
        .get(`/users/${response.body._id}`).set('Authorization', auth))
        .then(response=>{
          expect(response.status).toBe(200)
          expect(response.body.name).toBe('User')
          expect(response.body.email).toBe('user@gmail.com')
          expect(response.body.cpf).toBe('675.028.852-93')
          expect(response.body.password).toBeUndefined()
      }).catch(fail)
  })

  test('get /users - findByEmail', () => {
    return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'Bill Gates',
      email: 'billgates@gmail.com',
      password: '123456',
    }).then(response =>
    request(address)
    .get('/users')
    .set('Authorization', auth)
    .query({email: 'billgates@gmail.com'}))
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body.items).toBeInstanceOf(Array)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].email).toBe('billgates@gmail.com')
    }).catch(fail)
  })

  test('post /users', () => {
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        name: 'Mark Zuckerberg',
        email: 'mark@facebook.com',
        password: '123456',
        gender: 'Male',
        cpf: '035.869.640-21'
      })
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.body._id).toBeDefined()
        expect(response.body.name).toBe('Mark Zuckerberg')
        expect(response.body.email).toBe('mark@facebook.com')
        expect(response.body.password).toBeUndefined()
        expect(response.body.gender).toBe('Male')
        expect(response.body.cpf).toBe('035.869.640-21')
      }).catch(fail)
  })

  test('post /users - Required name', () => {
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        email: 'user@gmail.com',
        password: '123456',
        cpf: '675.028.852-93'
      })
      .then(response=>{
        expect(response.status).toBe(400)
        expect(response.body.errors).toBeInstanceOf(Array)
        expect(response.body.errors[0].message).toContain('name')
      }).catch(fail)
  })

  test('post /users - Duplicated email', () => {
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        name: 'dummy',
        email: 'dummy@gmail.com',
        password: '123456',
        cpf: '593.436.344-12'
      }).then(response =>
        request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
          name: 'dummy',
          email: 'dummy@gmail.com',
          password: '123456',
          cpf: '593.436.344-12'
      }))
      .then(response => {
        expect(response.status).toBe(400)
        expect(response.body.message).toContain('E11000 duplicate key')
      }).catch(fail)
  })

  test('post /users - Invalid CPF', ()=>{
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        name: 'User 1',
        email: 'user1@gmail.com',
        password: '123456',
        cpf: '675.028.222-93'
    })
    .then(response=>{
      expect(response.status).toBe(400)
      expect(response.body.errors).toBeInstanceOf(Array)
      expect(response.body.errors).toHaveLength(1)
      expect(response.body.errors[0].message).toContain('Invalid CPF')
    }).catch(fail)
  })

  test('patch /users/:id', () => {
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        "name": "Mark Zuckerberg 2",
        "email": "mark2@facebook.com",
        "password": "123456"
      })
      .then(response => request(address)
      .patch(`/users/${response.body._id}`)
      .set('Authorization', auth)
      .send({
        name: 'Mark Zuckerberg 2 - patch'
      }))
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.body._id).toBeDefined()
        expect(response.body.name).toBe('Mark Zuckerberg 2 - patch')
        expect(response.body.email).toBe('mark2@facebook.com')
        expect(response.body.password).toBeUndefined()
      })
      .catch(fail)
  })

  test('patch /users/aaaaa - Not found', () => {
    return request(address)
      .patch(`/users/aaaaa`)
      .set('Authorization', auth)
      .then(response=>{
        expect(response.status).toBe(404)
      }).catch(fail)
  })

  test('put /users:/id', () => {
    return request(address)
      .post('/users')
      .set('Authorization', auth)
      .send({
        name: 'User 2',
        email: 'user2@gmail.com',
        password: '123456',
        cpf: '613.586.318-59',
        gender: 'Male'
      }).then(response => request(address)
        .put(`/users/${response.body._id}`)
        .set('Authorization', auth)
        .send({
          name: 'User 2',
          email: 'user2@gmail.com',
          password: '123456',
          cpf: '613.586.318-59',
          gender: 'Female'
      }))
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('User 2')
        expect(response.body.email).toBe('user2@gmail.com')
        expect(response.body.cpf).toBe('613.586.318-59')
        expect(response.body.gender).toBe('Female')
        expect(response.body.password).toBeUndefined()
      }).catch(fail)
  })

  test('delete /users/aaaaa - Not found', () => {
    return request(address)
      .delete(`/users/aaaaa`)
      .set('Authorization', auth)
      .then(response => {
        expect(response.status).toBe(404)
      }).catch(fail)
  })

  test('delete /users:/id', () => {
    return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'User 3',
      email: 'user3@gmail.com',
      password: '123456',
      cpf: '187.638.581-26'
    }).then(response =>
      request(address)
      .delete(`/users/${response.body._id}`)
      .set('Authorization', auth))
      .then(response => {
        expect(response.status).toBe(204)
    }).catch(fail)
  })

  test('authenticate user - Not authorized', () => {
    return request(address)
      .post('/users/authenticate')
     .send({
       email: 'admin@email.com',
       password: '123'
     })
    .then(response => {
      expect(response.status).toBe(403)
    }).catch(fail)
  })

  test('authenticate user', () => {
    return request(address)
      .post('/users/authenticate')
      .send({
        email: 'admin@email.com',
        password: '123456'
    })
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body.accessToken).toBeDefined()
    }).catch(fail)
   })
})
