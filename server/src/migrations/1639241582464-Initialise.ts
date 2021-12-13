import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialise1639241582464 implements MigrationInterface {
    name = 'Initialise1639241582464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "name" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "oauth_account" ("id" character varying NOT NULL, "provider" character varying, "providerAccountId" character varying NOT NULL, "userId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0a52150ac8933527c48cea297f7" UNIQUE ("providerAccountId"), CONSTRAINT "PK_01ec7d2a8273dcaaed3dd10a4fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "oauth_account" ADD CONSTRAINT "FK_a9124d5956d6244b17bdd67f92b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_account" DROP CONSTRAINT "FK_a9124d5956d6244b17bdd67f92b"`);
        await queryRunner.query(`DROP TABLE "oauth_account"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
