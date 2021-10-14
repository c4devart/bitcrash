/*
SQLyog Ultimate
MySQL - 5.7.26-0ubuntu0.16.04.1 : Database - bitcrash
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`bitcrash` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;

USE `bitcrash`;

/*Table structure for table `admin` */

DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `CREATE_TIME` int(11) DEFAULT NULL,
  `UPDATE_TIME` int(11) DEFAULT NULL,
  `USERNAME` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `PASSWORD` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `DEL_YN` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `EMAIL` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `IPADDRESS` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `WALLET` int(12) DEFAULT NULL,
  `TOKEN` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`ID`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

/*Data for the table `admin` */

insert  into `admin`(`ID`,`CREATE_TIME`,`UPDATE_TIME`,`USERNAME`,`PASSWORD`,`DEL_YN`,`EMAIL`,`IPADDRESS`,`WALLET`,`TOKEN`) values 
(1,NULL,NULL,'admin','b59c67bf196a4758191e42f76670ceba','N','admin@support.com','0.0.0.0',-410,NULL);

/*Table structure for table `chats` */

DROP TABLE IF EXISTS `chats`;

CREATE TABLE `chats` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `CHAT_TYPE` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `CREATE_TIME` int(11) DEFAULT NULL,
  `UPDATE_TIME` int(11) DEFAULT NULL,
  `MSG` text COLLATE utf8_unicode_ci,
  `IPADDRESS` varchar(24) COLLATE utf8_unicode_ci DEFAULT '0.0.0.0',
  `DEL_YN` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `USERID` bigint(20) DEFAULT NULL,
  `CHANNEL` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'ENG',
  PRIMARY KEY (`ID`) USING BTREE,
  KEY `FK_USERS_TO_CHATS` (`USERID`) USING BTREE,
  CONSTRAINT `FK_USERS_TO_CHATS` FOREIGN KEY (`USERID`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

/*Data for the table `chats` */

insert  into `chats`(`ID`,`CHAT_TYPE`,`CREATE_TIME`,`UPDATE_TIME`,`MSG`,`IPADDRESS`,`DEL_YN`,`USERID`,`CHANNEL`) values 
(54,'crash_chat',1576911329,1576911329,'Hi  , every one. this is chat test.','0.0.0.0','N',1,'ENG'),
(55,'crash_chat',1576911354,1576911354,'Please check chat feature. Can you check now?','0.0.0.0','N',1,'ENG'),
(56,'crash_chat',1576926711,1576926711,'I am a new user','0.0.0.0','N',19,'ENG'),
(57,'crash_chat',1576926726,1576926726,'Please play crash game with me. Thanks','0.0.0.0','N',19,'ENG'),
(58,'crash_chat',1576926814,1576926814,'How can I play this game???','0.0.0.0','N',19,'ENG'),
(59,'crash_chat',1577189224,1577189224,'This is today test.','0.0.0.0','N',1,'ENG');

/*Table structure for table `crash_game_bot` */

DROP TABLE IF EXISTS `crash_game_bot`;

CREATE TABLE `crash_game_bot` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ENABLE` enum('0','1') COLLATE utf8_bin DEFAULT '0',
  `F_ID` varchar(128) COLLATE utf8_bin DEFAULT NULL,
  `BASE_VALUE` double(20,4) DEFAULT NULL,
  `BUST_FROM` double DEFAULT NULL,
  `BUST_TO` double DEFAULT NULL,
  `deleted` tinyint(4) DEFAULT '0' COMMENT '1: Deleted',
  `avatar` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=COMPACT;

/*Data for the table `crash_game_bot` */

insert  into `crash_game_bot`(`ID`,`ENABLE`,`F_ID`,`BASE_VALUE`,`BUST_FROM`,`BUST_TO`,`deleted`,`avatar`) values 
(1,'1','Kevin De Bruyner',1000.0000,1.2,3.22,0,'http://45.76.180.140:7801/img/uploads/avatar/bot_general.png'),
(2,'1','Andrey Cock',1000.0000,1.23,3.44,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar1.png'),
(3,'1','Lehmann',2000.0000,2.32,100,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar2.png'),
(4,'0','Willian Babbule',200.0000,1.11,1.11,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar3.png'),
(5,'1','Kingston',1200.0000,1.5,9.99,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar4.png'),
(6,'1','Nickon',2200.0000,3.9,11.5,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar5.png'),
(7,'1','Garry Tayler',600.0000,2.6,5.8,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar6.png'),
(8,'1','Telecom Sam',2800.0000,1.5,5.6,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar7.png'),
(9,'1','Sales Force',1500.0000,4.3,7.9,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar8.png'),
(10,'1','Kiash',1700.0000,1.5,3.8,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar3.png'),
(11,'1','Sanele',2000.0000,1.3,5.4,0,'http://45.76.180.140:7801/img/uploads/avatar/avatar5.png');

/*Table structure for table `crash_game_hashes` */

DROP TABLE IF EXISTS `crash_game_hashes`;

CREATE TABLE `crash_game_hashes` (
  `ID` bigint(20) DEFAULT NULL,
  `GAME_ID` bigint(20) DEFAULT NULL,
  `HASH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `crash_game_hashes` */

/*Table structure for table `crash_game_log` */

DROP TABLE IF EXISTS `crash_game_log`;

CREATE TABLE `crash_game_log` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `CREATE_TIME` int(11) DEFAULT NULL,
  `UPDATE_TIME` int(11) DEFAULT NULL,
  `BET_AMOUNT` int(12) DEFAULT NULL,
  `GAMENO` bigint(20) DEFAULT NULL,
  `USERID` bigint(20) DEFAULT NULL,
  `IS_BOT` tinyint(4) DEFAULT '1',
  `BET` int(12) DEFAULT '0',
  `CASHOUTRATE` double DEFAULT '0',
  `CASHOUT` int(11) DEFAULT '0',
  `PROFIT` int(11) DEFAULT '0',
  PRIMARY KEY (`ID`) USING BTREE,
  KEY `FK_ROULETTE_GAME_TO_ROULETTE_GAME_LOG` (`GAMENO`) USING BTREE,
  KEY `FK_USERS_TO_ROULETTE_GAME_LOG` (`USERID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

/*Data for the table `crash_game_log` */

/*Table structure for table `crash_game_total` */

DROP TABLE IF EXISTS `crash_game_total`;

CREATE TABLE `crash_game_total` (
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `REGTIME` int(12) DEFAULT NULL,
  `UPDATETIME` int(12) DEFAULT NULL,
  `GAMENO` int(10) unsigned DEFAULT NULL,
  `STARTTIME` int(11) DEFAULT NULL,
  `BUSTEDTIME` int(11) DEFAULT NULL,
  `BUST` double(20,2) unsigned DEFAULT '0.00',
  `TOTAL` int(12) unsigned DEFAULT '0',
  `PROFIT` int(12) DEFAULT '0',
  `USERS` int(10) unsigned DEFAULT '0',
  `BOTS` int(10) unsigned DEFAULT '0',
  `HASH` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `ISDELETE` enum('0','1') COLLATE utf8_unicode_ci DEFAULT '0',
  `STATE` enum('WAITING','STARTED','BUSTED') COLLATE utf8_unicode_ci DEFAULT 'WAITING',
  `TOTAL_REAL` int(12) DEFAULT NULL COMMENT '//except bot amount',
  PRIMARY KEY (`ID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC;

/*Data for the table `crash_game_total` */

/*Table structure for table `cron` */

DROP TABLE IF EXISTS `cron`;

CREATE TABLE `cron` (
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `CREATE_TIME` int(12) DEFAULT NULL,
  `DATE` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

/*Data for the table `cron` */

/*Table structure for table `faq` */

DROP TABLE IF EXISTS `faq`;

CREATE TABLE `faq` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `create_time` int(12) DEFAULT NULL,
  `type` tinyint(4) DEFAULT '0' COMMENT '0: GettingStarted, 1: Payment',
  `answer` varchar(255) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `deleted` tinyint(4) DEFAULT '0' COMMENT '1: Deleted',
  `update_time` int(12) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `faq` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `USERNAME` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `PASSWORD` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `EMAIL` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `CREATE_TIME` timestamp NULL DEFAULT NULL,
  `UPDATE_TIME` timestamp NULL DEFAULT NULL,
  `DEL_YN` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `IPADDRESS` varchar(50) COLLATE utf8_unicode_ci DEFAULT '0.0.0.0',
  `EMAIL_VERIFIED_YN` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `STATE` int(3) NOT NULL DEFAULT '0' COMMENT '0: active\r\n	1: stop\r\n	2: block\r\n	',
  `AVATAR` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `LAST_IPADDRESS` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `WALLET` int(12) DEFAULT '0',
  `API_TOKEN` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `WALLET_BLOCK` int(12) DEFAULT '0',
  `WALLET_AVAILABLE` int(12) DEFAULT '0',
  `LAST_VISIT` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ID`) USING BTREE,
  UNIQUE KEY `UIX_USERS` (`USERNAME`,`EMAIL`,`ID`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

/*Data for the table `users` */

insert  into `users`(`ID`,`USERNAME`,`PASSWORD`,`EMAIL`,`CREATE_TIME`,`UPDATE_TIME`,`DEL_YN`,`IPADDRESS`,`EMAIL_VERIFIED_YN`,`STATE`,`AVATAR`,`LAST_IPADDRESS`,`WALLET`,`API_TOKEN`,`WALLET_BLOCK`,`WALLET_AVAILABLE`,`LAST_VISIT`) values 
(1,'Test Account','912ec803b2ce49e4a541068d495ab570','test@test.com','2019-12-12 11:28:38',NULL,'N','0.0.0.0','Y',0,'http://45.76.180.140:7801/img/uploads/avatar/avatar-medium.png','::1',100410,'tB3A2H0NA1hpcNKpsJJeu44S',0,0,NULL),
(19,'bituser','912ec803b2ce49e4a541068d495ab570','bituser@gmail.com','2019-12-21 11:10:36',NULL,'N','0.0.0.0','N',0,'http://45.76.180.140:7801/img/uploads/avatar/general_profile.png',NULL,0,'oNwwO1kGn78eAT0qpYRXXbioY',0,0,NULL);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
