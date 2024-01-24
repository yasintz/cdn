import { StoreType } from '../types';
import { PersonBuilder } from './builder';

export class IsBuilder {
  constructor(
    private readonly target: PersonBuilder,
    private readonly store: StoreType
  ) {}

  partner = ({ person }: PersonBuilder) => {
    return this.target.partners.some((i) => i.id === person.id);
  };

  child = ({ person }: PersonBuilder) => {
    return this.target.parents.some((i) => i.id === person.id);
  };
  //   return {
  //     mother: (person) =>
  //       person.parents.some(
  //         (i) => i.id === person.id && i.gender === GenderEnum.Female
  //       ),

  //     father: (person) =>
  //       person.parents.some(
  //         (i) => i.id === person.id && i.gender === GenderEnum.Male
  //       ),

  //     parent: (person) => person.parents.some((i) => i.id === person.id),

  //     grandParent: (person) =>
  //       builder(person, store).parents.some((parent) =>
  //         builder(parent, store).is.child(person)
  //       ),

  //     uncle: (person) =>
  //       person.parents.some((parent) =>
  //         builder(parent, store).siblings.some(
  //           (i) => i.id === target.id && i.gender === GenderEnum.Male
  //         )
  //       ),
  //     aunt: (person) =>
  //       person.parents.some((parent) =>
  //         builder(parent, store).siblings.some(
  //           (i) => i.id === target.id && i.gender === GenderEnum.Female
  //         )
  //       ),
  //   };
}
