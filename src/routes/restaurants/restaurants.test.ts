import 'jest'
import * as request from 'supertest'

const address: string = (<any>global).address
const auth: string = (<any>global).auth

describe('Test Restaurants', function() {
  test('get /restaurants', () => {
    return request(address)
      .get('/restaurants')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.body.items).toBeInstanceOf(Array)
      }).catch(fail)
  })

  test('get /restaurants/aaaaa - Not found', () => {
    return request(address)
      .get('/restaurants/aaaaa')
      .then(response => {
        expect(response.status).toBe(404)
      }).catch(fail)
  })

  test('post /restaurants', () => {
    return request(address)
      .post('/restaurants')
      .set('Authorization', auth)
      .send({
        name: 'Burger House',
        menu: [{name: "Coke", price: 5}]
      })
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.body._id).toBeDefined()
        expect(response.body.name).toBe('Burger House')
        expect(response.body.menu).toBeInstanceOf(Array)
        expect(response.body.menu).toHaveLength(1)
        expect(response.body.menu[0]).toMatchObject({name: "Coke", price: 5})
      }).catch(fail)
  })
})
