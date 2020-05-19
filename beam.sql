CREATE TABLE `accounts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `coinid` int(11) DEFAULT NULL,
  `username` varchar(96) DEFAULT NULL,
  `ip` varchar(96) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `blocks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `coinid` int(11) DEFAULT NULL,
  `time` int(18) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `workerid` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `sharediff` float DEFAULT NULL,
  `blockdiff` float DEFAULT NULL,
 `confirmations` float DEFAULT NULL,
 `difficulty` float DEFAULT NULL,
  `blockhash` varchar(64) DEFAULT NULL,
  `category` varchar(32) DEFAULT NULL,
  `reward` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `workers` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(11) DEFAULT NULL,
  `ip` varchar(96) DEFAULT NULL,
  `name` varchar(96) DEFAULT NULL,
  `difficulty` int(11) DEFAULT NULL,
  `rigname` varchar(32) DEFAULT NULL,
  `time` int(18) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `shares` (
  `userid` int(11) DEFAULT NULL,   `coinid` int(11) DEFAULT NULL,
  `time` int(18) DEFAULT NULL,
 `difficulty` (double) DEFAULT NULL,
  `sharediff` (double) DEFAULT NULL,
) ENGINE=InnoDB DEFAULT=19 DEFAULT CHARSET=utf8mb4;

