import React from 'react'
import { mount } from 'enzyme'
import Demo from '..'

describe('demo', () => {
  it('test demo', () => {
    const wrapper = mount(<Demo>content</Demo>)
    expect(wrapper).toMatchSnapshot()
  })
})
