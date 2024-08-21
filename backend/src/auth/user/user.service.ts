
import { Injectable } from '@nestjs/common';
import { UserCredentials } from './user-credentials.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserData } from './user-data.entity';
import { SignUpUserDto } from './user-dto/sign-up-user.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { UpdateUserDataDto } from './user-dto/update-user-data.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserCredentials)
        private readonly userCredentialsRepository: Repository<UserCredentials>,
        @InjectRepository(UserData)
        private readonly userDataRepository: Repository<UserData>,
    ){}

    async findByEmail(email: string) {
        return await this.userCredentialsRepository.findOne({
            where: { email }
        });
    }

 

    async findOneById(userCredentialsId: number): Promise<any> {
        const user = await this.userCredentialsRepository.createQueryBuilder('UserCredentials')
              .leftJoinAndSelect('UserCredentials.userData', 'userData') // Łączenie z tabelą userData
              .where('UserCredentials.userCredentialsId = :id', { id: userCredentialsId })
              .getOne(); // Zwraca pełne obiekty encji, w tym powiązane dane
          
        const { userDataId, ...userDataWithoutId } = user.userData; // Usuwamy id z userData
        return {
            email: user.email,
            ...userDataWithoutId
        }
      }


    async signUp(signUpUserDto: SignUpUserDto): Promise<any> {

        const { email, password, ...signUpUserDtoWithoutEmailAndPassword } = signUpUserDto;

        const userCredentials = this.userCredentialsRepository.create({ 
            email: email, 
            password: password, 
            roles: [Role.User]
        });
        const savedUserCredentials = await this.userCredentialsRepository.save(userCredentials);
    
        const userData = this.userDataRepository.create({
          ...signUpUserDtoWithoutEmailAndPassword,
          avatar: signUpUserDtoWithoutEmailAndPassword.avatar,
          userCredentials: savedUserCredentials, // create a OneToOne relationship
        });
        const savedUserData = await this.userDataRepository.save(userData);

        return savedUserCredentials;
      }

    async updateUserData(userCredentialsId: number, updateUserDto: UpdateUserDataDto): Promise<UserData> {

        const userData = await this.userDataRepository.findOne({
            where: { userCredentials: { userCredentialsId: userCredentialsId } },
        });

        if (!userData) {
            throw new Error('UserData not found');
        }

        Object.assign(userData, updateUserDto);
    
        return this.userDataRepository.save(userData);
    }
}
