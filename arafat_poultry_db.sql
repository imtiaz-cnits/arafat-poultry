-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: arafat_poultry_db
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` longtext COLLATE utf8mb4_unicode_ci,
  `new_values` longtext COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_logs_entity_type_entity_id_idx` (`entity_type`,`entity_id`),
  KEY `audit_logs_user_id_idx` (`user_id`),
  KEY `audit_logs_action_idx` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=252 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'CREATE','INTERNAL_FEED_ISSUE','1',NULL,'{\"issue_no\":\"ISS-20261027-2510\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 04:31:45'),(2,1,'CREATE','INTERNAL_FEED_ISSUE','2',NULL,'{\"issue_no\":\"ISS-20261027-6212\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 04:39:16'),(3,1,'CREATE','INTERNAL_FEED_ISSUE','3',NULL,'{\"issue_no\":\"ISS-20261027-9807\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 04:39:16'),(4,1,'CREATE','INTERNAL_FEED_ISSUE','4',NULL,'{\"issue_no\":\"ISS-20261027-2811\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 04:39:47'),(5,1,'CREATE','INTERNAL_FEED_ISSUE','5',NULL,'{\"issue_no\":\"ISS-20261027-4755\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 04:39:48'),(6,1,'CREATE','INTERNAL_FEED_ISSUE','6',NULL,'{\"issue_no\":\"ISS-20261027-6045\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 04:40:06'),(7,1,'CREATE','INTERNAL_FEED_ISSUE','7',NULL,'{\"issue_no\":\"ISS-20261027-9948\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 04:40:07'),(8,1,'CREATE','INTERNAL_FEED_ISSUE','8',NULL,'{\"issue_no\":\"ISS-20261027-2528\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 04:41:21'),(9,1,'CREATE','INTERNAL_FEED_ISSUE','9',NULL,'{\"issue_no\":\"ISS-20261027-2689\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 04:41:21'),(10,1,'CREATE','INTERNAL_FEED_ISSUE','10',NULL,'{\"issue_no\":\"ISS-20261027-5318\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 05:51:26'),(11,1,'CREATE','INTERNAL_FEED_ISSUE','11',NULL,'{\"issue_no\":\"ISS-20261027-1237\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 05:51:26'),(12,1,'CREATE','EGG_COLLECTION','1',NULL,'{\"collection_no\":\"EGG-20261027-4241\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 05:57:19'),(13,1,'CREATE','EGG_COLLECTION','2',NULL,'{\"collection_no\":\"EGG-20261027-3538\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 05:58:05'),(14,1,'CREATE','EGG_COLLECTION','3',NULL,'{\"collection_no\":\"EGG-20261027-9679\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 05:58:05'),(15,1,'UPDATE','EGG_COLLECTION','3',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 05:58:05'),(16,1,'CREATE','INTERNAL_FEED_ISSUE','12',NULL,'{\"issue_no\":\"ISS-20261027-3801\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 05:58:22'),(17,1,'CREATE','INTERNAL_FEED_ISSUE','13',NULL,'{\"issue_no\":\"ISS-20261027-5195\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 05:58:22'),(18,1,'CREATE','EGG_COLLECTION','4',NULL,'{\"collection_no\":\"EGG-20261027-6637\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:04:21'),(19,1,'CREATE','INTERNAL_FEED_ISSUE','14',NULL,'{\"issue_no\":\"ISS-20261027-8989\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 06:04:21'),(20,1,'CREATE','INTERNAL_FEED_ISSUE','15',NULL,'{\"issue_no\":\"ISS-20261027-6058\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 06:04:22'),(21,1,'CREATE','EGG_COLLECTION','5',NULL,'{\"collection_no\":\"EGG-20261027-9011\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:04:22'),(22,1,'UPDATE','EGG_COLLECTION','5',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 06:04:22'),(23,1,'CREATE','FISH_POND','2',NULL,'{\"pond_code\":\"POND-TEST-1793103499453\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-27 06:18:19'),(24,1,'CREATE','FISH_BATCH','1',NULL,'{\"batch_no\":\"BATCH-P2-202610-494\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:18:19'),(25,1,'CREATE','INTERNAL_FEED_ISSUE','16',NULL,'{\"issue_no\":\"ISS-20261027-7929\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-27 06:18:20'),(26,1,'UPDATE','FISH_BATCH','1',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-27 06:18:20'),(27,1,'CREATE','FISH_HARVEST','1',NULL,'{\"harvest_no\":\"HRV-20261027-6670\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-27 06:18:20'),(28,1,'CREATE','FISH_HARVEST','2',NULL,'{\"harvest_no\":\"HRV-20261027-3121\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-27 06:18:20'),(29,1,'CREATE','FISH_BATCH','2',NULL,'{\"batch_no\":\"BATCH-P2-202610-477\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:18:20'),(30,1,'CREATE','FISH_POND','3',NULL,'{\"pond_code\":\"POND-TEST-1793103825987\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-27 06:23:46'),(31,1,'CREATE','EGG_COLLECTION','6',NULL,'{\"collection_no\":\"EGG-20261027-8515\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:23:46'),(32,1,'CREATE','FISH_BATCH','3',NULL,'{\"batch_no\":\"BATCH-P3-202610-873\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:23:46'),(33,1,'CREATE','INTERNAL_FEED_ISSUE','17',NULL,'{\"issue_no\":\"ISS-20261027-5496\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 06:23:46'),(34,1,'CREATE','INTERNAL_FEED_ISSUE','18',NULL,'{\"issue_no\":\"ISS-20261027-7640\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-27 06:23:46'),(35,1,'CREATE','INTERNAL_FEED_ISSUE','19',NULL,'{\"issue_no\":\"ISS-20261027-8646\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 06:23:46'),(36,1,'UPDATE','FISH_BATCH','3',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-27 06:23:46'),(37,1,'CREATE','FISH_HARVEST','3',NULL,'{\"harvest_no\":\"HRV-20261027-1731\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-27 06:23:46'),(38,1,'CREATE','FISH_HARVEST','4',NULL,'{\"harvest_no\":\"HRV-20261027-9511\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-27 06:23:46'),(39,1,'CREATE','FISH_BATCH','4',NULL,'{\"batch_no\":\"BATCH-P3-202610-728\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:23:46'),(40,1,'CREATE','EGG_COLLECTION','7',NULL,'{\"collection_no\":\"EGG-20261027-9175\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:23:46'),(41,1,'UPDATE','EGG_COLLECTION','7',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 06:23:46'),(42,1,'CREATE','INTERNAL_FEED_ISSUE','20',NULL,'{\"issue_no\":\"ISS-20261027-6760\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 06:24:06'),(43,1,'CREATE','INTERNAL_FEED_ISSUE','21',NULL,'{\"issue_no\":\"ISS-20261027-2976\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 06:24:06'),(44,1,'CREATE','EGG_COLLECTION','8',NULL,'{\"collection_no\":\"EGG-20261027-6657\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:24:07'),(45,1,'CREATE','EGG_COLLECTION','9',NULL,'{\"collection_no\":\"EGG-20261027-5724\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:24:07'),(46,1,'UPDATE','EGG_COLLECTION','9',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 06:24:07'),(47,1,'CREATE','FISH_POND','4',NULL,'{\"pond_code\":\"POND-TEST-1793103847848\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-27 06:24:08'),(48,1,'CREATE','FISH_BATCH','5',NULL,'{\"batch_no\":\"BATCH-P4-202610-424\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:24:08'),(49,1,'CREATE','INTERNAL_FEED_ISSUE','22',NULL,'{\"issue_no\":\"ISS-20261027-1510\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-27 06:24:08'),(50,1,'CREATE','FISH_HARVEST','5',NULL,'{\"harvest_no\":\"HRV-20261027-2630\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":2083.3333333333335,\"cost_per_kg\":2.450980392156863}',NULL,NULL,'2026-10-27 06:24:08'),(51,1,'CREATE','FISH_HARVEST','6',NULL,'{\"harvest_no\":\"HRV-20261027-6302\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":7916.67,\"cost_per_kg\":2.473959375}',NULL,NULL,'2026-10-27 06:24:08'),(52,1,'CREATE','FISH_BATCH','6',NULL,'{\"batch_no\":\"BATCH-P4-202610-819\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:24:08'),(53,1,'CREATE','INTERNAL_FEED_ISSUE','23',NULL,'{\"issue_no\":\"ISS-20261027-7759\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 06:25:57'),(54,1,'CREATE','INTERNAL_FEED_ISSUE','24',NULL,'{\"issue_no\":\"ISS-20261027-3721\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 06:25:57'),(55,1,'CREATE','EGG_COLLECTION','10',NULL,'{\"collection_no\":\"EGG-20261027-5803\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:25:57'),(56,1,'CREATE','EGG_COLLECTION','11',NULL,'{\"collection_no\":\"EGG-20261027-4501\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 06:25:58'),(57,1,'UPDATE','EGG_COLLECTION','11',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 06:25:58'),(58,1,'CREATE','FISH_POND','5',NULL,'{\"pond_code\":\"POND-TEST-1793103958085\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-27 06:25:58'),(59,1,'CREATE','FISH_BATCH','7',NULL,'{\"batch_no\":\"BATCH-P5-202610-160\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:25:58'),(60,1,'CREATE','INTERNAL_FEED_ISSUE','25',NULL,'{\"issue_no\":\"ISS-20261027-7534\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-27 06:25:58'),(61,1,'UPDATE','FISH_BATCH','7',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-27 06:25:58'),(62,1,'CREATE','FISH_HARVEST','7',NULL,'{\"harvest_no\":\"HRV-20261027-1481\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-27 06:25:58'),(63,1,'CREATE','FISH_HARVEST','8',NULL,'{\"harvest_no\":\"HRV-20261027-8421\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-27 06:25:58'),(64,1,'CREATE','FISH_BATCH','8',NULL,'{\"batch_no\":\"BATCH-P5-202610-284\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-27 06:25:58'),(65,1,'CREATE','INTERNAL_FEED_ISSUE','26',NULL,'{\"issue_no\":\"ISS-20261028-8291\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-27 23:46:26'),(66,1,'CREATE','FISH_BATCH','9',NULL,'{\"batch_no\":\"BATCH-P6-202610-989\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-27 23:46:26'),(67,1,'CREATE','FISH_HARVEST','9',NULL,'{\"harvest_no\":\"HRV-20261028-4350\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-27 23:46:26'),(68,1,'CREATE','EGG_COLLECTION','12',NULL,'{\"collection_no\":\"EGG-20261028-7068\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-27 23:46:26'),(69,1,'CREATE','RECEIPT_VOUCHER','RV-1793166557992',NULL,'{\"customerId\":137,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-27 23:49:18'),(70,1,'CREATE','INTERNAL_FEED_ISSUE','27',NULL,'{\"issue_no\":\"ISS-20261028-2853\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-27 23:49:18'),(71,1,'CREATE','FISH_BATCH','10',NULL,'{\"batch_no\":\"BATCH-P7-202610-772\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-27 23:49:18'),(72,1,'CREATE','FISH_HARVEST','10',NULL,'{\"harvest_no\":\"HRV-20261028-7924\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-27 23:49:19'),(73,1,'CREATE','EGG_COLLECTION','13',NULL,'{\"collection_no\":\"EGG-20261028-6827\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-27 23:49:19'),(74,1,'CREATE','RECEIPT_VOUCHER','RV-1793166625412',NULL,'{\"customerId\":138,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-27 23:50:25'),(75,1,'CREATE','INTERNAL_FEED_ISSUE','28',NULL,'{\"issue_no\":\"ISS-20261028-1318\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-27 23:50:26'),(76,1,'CREATE','FISH_BATCH','11',NULL,'{\"batch_no\":\"BATCH-P8-202610-341\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-27 23:50:26'),(77,1,'CREATE','FISH_HARVEST','11',NULL,'{\"harvest_no\":\"HRV-20261028-9621\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-27 23:50:26'),(78,1,'CREATE','EGG_COLLECTION','14',NULL,'{\"collection_no\":\"EGG-20261028-2509\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-27 23:50:26'),(79,1,'CREATE','PAYMENT_VOUCHER','PV-1793166645761',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-27 23:50:46'),(80,1,'CREATE','RECEIPT_VOUCHER','RV-1793166645939',NULL,'{\"customerId\":139,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-27 23:50:46'),(81,1,'CREATE','INTERNAL_FEED_ISSUE','29',NULL,'{\"issue_no\":\"ISS-20261028-4100\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-27 23:50:46'),(82,1,'CREATE','FISH_BATCH','12',NULL,'{\"batch_no\":\"BATCH-P9-202610-376\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-27 23:50:46'),(83,1,'CREATE','FISH_HARVEST','12',NULL,'{\"harvest_no\":\"HRV-20261028-1240\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-27 23:50:46'),(84,1,'CREATE','EGG_COLLECTION','15',NULL,'{\"collection_no\":\"EGG-20261028-9628\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-27 23:50:46'),(85,1,'CREATE','INTERNAL_FEED_ISSUE','30',NULL,'{\"issue_no\":\"ISS-20261028-1193\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-27 23:56:24'),(86,1,'CREATE','INTERNAL_FEED_ISSUE','31',NULL,'{\"issue_no\":\"ISS-20261028-7648\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-27 23:56:24'),(87,1,'CREATE','EGG_COLLECTION','16',NULL,'{\"collection_no\":\"EGG-20261028-1802\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 23:56:25'),(88,1,'CREATE','EGG_COLLECTION','17',NULL,'{\"collection_no\":\"EGG-20261028-5016\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 23:56:25'),(89,1,'UPDATE','EGG_COLLECTION','17',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 23:56:25'),(90,1,'CREATE','FISH_POND','10',NULL,'{\"pond_code\":\"POND-TEST-1793166985497\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-27 23:56:26'),(91,1,'CREATE','FISH_BATCH','13',NULL,'{\"batch_no\":\"BATCH-P10-202610-962\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-27 23:56:26'),(92,1,'CREATE','INTERNAL_FEED_ISSUE','32',NULL,'{\"issue_no\":\"ISS-20261028-9328\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-27 23:56:26'),(93,1,'UPDATE','FISH_BATCH','13',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-27 23:56:26'),(94,1,'CREATE','FISH_HARVEST','13',NULL,'{\"harvest_no\":\"HRV-20261028-6958\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-27 23:56:26'),(95,1,'CREATE','FISH_HARVEST','14',NULL,'{\"harvest_no\":\"HRV-20261028-7821\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-27 23:56:26'),(96,1,'CREATE','FISH_BATCH','14',NULL,'{\"batch_no\":\"BATCH-P10-202610-698\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-27 23:56:26'),(97,1,'CREATE','PAYMENT_VOUCHER','PV-1793166986711',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-27 23:56:27'),(98,1,'CREATE','RECEIPT_VOUCHER','RV-1793166986918',NULL,'{\"customerId\":147,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-27 23:56:27'),(99,1,'CREATE','INTERNAL_FEED_ISSUE','33',NULL,'{\"issue_no\":\"ISS-20261028-5536\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-27 23:56:27'),(100,1,'CREATE','FISH_BATCH','15',NULL,'{\"batch_no\":\"BATCH-P11-202610-802\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-27 23:56:27'),(101,1,'CREATE','FISH_HARVEST','15',NULL,'{\"harvest_no\":\"HRV-20261028-6854\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-27 23:56:27'),(102,1,'CREATE','EGG_COLLECTION','18',NULL,'{\"collection_no\":\"EGG-20261028-8508\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-27 23:56:27'),(103,1,'CREATE','EGG_COLLECTION','19',NULL,'{\"collection_no\":\"EGG-20261028-8127\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 23:59:24'),(104,1,'CREATE','EGG_COLLECTION','20',NULL,'{\"collection_no\":\"EGG-20261028-8305\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-27 23:59:24'),(105,1,'UPDATE','EGG_COLLECTION','20',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-27 23:59:24'),(106,1,'CREATE','EGG_COLLECTION','21',NULL,'{\"collection_no\":\"EGG-20261028-1707\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:01:10'),(107,1,'CREATE','EGG_COLLECTION','22',NULL,'{\"collection_no\":\"EGG-20261028-3298\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:01:10'),(108,1,'UPDATE','EGG_COLLECTION','22',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:01:10'),(109,1,'CREATE','FISH_POND','12',NULL,'{\"pond_code\":\"POND-TEST-1793167421613\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:03:42'),(110,1,'CREATE','FISH_BATCH','16',NULL,'{\"batch_no\":\"BATCH-P12-202610-332\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:03:42'),(111,1,'CREATE','INTERNAL_FEED_ISSUE','34',NULL,'{\"issue_no\":\"ISS-20261028-8801\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:03:42'),(112,1,'CREATE','FISH_HARVEST','16',NULL,'{\"harvest_no\":\"HRV-20261028-3549\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":2083.3333333333335,\"cost_per_kg\":2.450980392156863}',NULL,NULL,'2026-10-28 00:03:42'),(113,1,'CREATE','FISH_HARVEST','17',NULL,'{\"harvest_no\":\"HRV-20261028-2398\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":7916.67,\"cost_per_kg\":2.473959375}',NULL,NULL,'2026-10-28 00:03:42'),(114,1,'CREATE','FISH_BATCH','17',NULL,'{\"batch_no\":\"BATCH-P12-202610-536\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:03:42'),(115,1,'CREATE','FISH_POND','13',NULL,'{\"pond_code\":\"POND-TEST-1793167505779\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:05:06'),(116,1,'CREATE','FISH_BATCH','18',NULL,'{\"batch_no\":\"BATCH-P13-202610-841\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:05:06'),(117,1,'CREATE','INTERNAL_FEED_ISSUE','35',NULL,'{\"issue_no\":\"ISS-20261028-4949\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:05:06'),(118,1,'UPDATE','FISH_BATCH','18',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:05:06'),(119,1,'CREATE','FISH_HARVEST','18',NULL,'{\"harvest_no\":\"HRV-20261028-8425\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:05:06'),(120,1,'CREATE','FISH_HARVEST','19',NULL,'{\"harvest_no\":\"HRV-20261028-1813\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:05:06'),(121,1,'CREATE','FISH_BATCH','19',NULL,'{\"batch_no\":\"BATCH-P13-202610-323\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:05:06'),(122,1,'CREATE','EGG_COLLECTION','23',NULL,'{\"collection_no\":\"EGG-20261028-1823\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:05:19'),(123,1,'CREATE','FISH_POND','14',NULL,'{\"pond_code\":\"POND-TEST-1793167519074\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:05:19'),(124,1,'CREATE','FISH_BATCH','20',NULL,'{\"batch_no\":\"BATCH-P14-202610-303\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:05:19'),(125,1,'CREATE','INTERNAL_FEED_ISSUE','36',NULL,'{\"issue_no\":\"ISS-20261028-8936\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:05:19'),(126,1,'UPDATE','FISH_BATCH','20',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:05:19'),(127,1,'CREATE','FISH_HARVEST','20',NULL,'{\"harvest_no\":\"HRV-20261028-2039\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:05:19'),(128,1,'CREATE','FISH_HARVEST','21',NULL,'{\"harvest_no\":\"HRV-20261028-3863\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:05:19'),(129,1,'CREATE','FISH_BATCH','21',NULL,'{\"batch_no\":\"BATCH-P14-202610-581\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:05:19'),(130,1,'CREATE','EGG_COLLECTION','24',NULL,'{\"collection_no\":\"EGG-20261028-7833\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:05:20'),(131,1,'UPDATE','EGG_COLLECTION','24',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:05:20'),(132,1,'CREATE','EGG_COLLECTION','25',NULL,'{\"collection_no\":\"EGG-20261028-3286\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:06:55'),(133,1,'CREATE','FISH_POND','15',NULL,'{\"pond_code\":\"POND-TEST-1793167615300\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:06:55'),(134,1,'CREATE','FISH_BATCH','22',NULL,'{\"batch_no\":\"BATCH-P15-202610-175\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:06:55'),(135,1,'CREATE','INTERNAL_FEED_ISSUE','37',NULL,'{\"issue_no\":\"ISS-20261028-7851\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:06:55'),(136,1,'UPDATE','FISH_BATCH','22',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:06:55'),(137,1,'CREATE','FISH_HARVEST','22',NULL,'{\"harvest_no\":\"HRV-20261028-6078\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:06:56'),(138,1,'CREATE','EGG_COLLECTION','26',NULL,'{\"collection_no\":\"EGG-20261028-7152\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:06:56'),(139,1,'UPDATE','EGG_COLLECTION','26',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:06:56'),(140,1,'CREATE','FISH_HARVEST','23',NULL,'{\"harvest_no\":\"HRV-20261028-8946\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:06:56'),(141,1,'CREATE','FISH_BATCH','23',NULL,'{\"batch_no\":\"BATCH-P15-202610-428\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:06:56'),(142,1,'CREATE','INTERNAL_FEED_ISSUE','38',NULL,'{\"issue_no\":\"ISS-20261028-9365\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:09:36'),(143,1,'CREATE','INTERNAL_FEED_ISSUE','39',NULL,'{\"issue_no\":\"ISS-20261028-3758\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:09:36'),(144,1,'CREATE','EGG_COLLECTION','27',NULL,'{\"collection_no\":\"EGG-20261028-2453\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:09:37'),(145,1,'CREATE','EGG_COLLECTION','28',NULL,'{\"collection_no\":\"EGG-20261028-2228\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:09:37'),(146,1,'UPDATE','EGG_COLLECTION','28',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:09:37'),(147,1,'CREATE','FISH_POND','16',NULL,'{\"pond_code\":\"POND-TEST-1793167777458\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:09:37'),(148,1,'CREATE','FISH_BATCH','24',NULL,'{\"batch_no\":\"BATCH-P16-202610-732\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:09:37'),(149,1,'CREATE','INTERNAL_FEED_ISSUE','40',NULL,'{\"issue_no\":\"ISS-20261028-9875\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:09:38'),(150,1,'UPDATE','FISH_BATCH','24',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:09:38'),(151,1,'CREATE','FISH_HARVEST','24',NULL,'{\"harvest_no\":\"HRV-20261028-2012\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:09:38'),(152,1,'CREATE','FISH_HARVEST','25',NULL,'{\"harvest_no\":\"HRV-20261028-9370\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:09:38'),(153,1,'CREATE','FISH_BATCH','25',NULL,'{\"batch_no\":\"BATCH-P16-202610-294\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:09:38'),(154,1,'CREATE','PAYMENT_VOUCHER','PV-1793167778532',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:09:39'),(155,1,'CREATE','RECEIPT_VOUCHER','RV-1793167778698',NULL,'{\"customerId\":168,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:09:39'),(156,1,'CREATE','INTERNAL_FEED_ISSUE','41',NULL,'{\"issue_no\":\"ISS-20261028-1880\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-28 00:09:39'),(157,1,'CREATE','FISH_BATCH','26',NULL,'{\"batch_no\":\"BATCH-P17-202610-763\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-28 00:09:39'),(158,1,'CREATE','FISH_HARVEST','26',NULL,'{\"harvest_no\":\"HRV-20261028-5363\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-28 00:09:39'),(159,1,'CREATE','EGG_COLLECTION','29',NULL,'{\"collection_no\":\"EGG-20261028-8669\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-28 00:09:39'),(160,1,'CREATE','INTERNAL_FEED_ISSUE','42',NULL,'{\"issue_no\":\"ISS-20261028-1696\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:10:30'),(161,1,'CREATE','INTERNAL_FEED_ISSUE','43',NULL,'{\"issue_no\":\"ISS-20261028-7325\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:10:30'),(162,1,'CREATE','EGG_COLLECTION','30',NULL,'{\"collection_no\":\"EGG-20261028-6745\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:10:50'),(163,1,'CREATE','FISH_POND','18',NULL,'{\"pond_code\":\"POND-TEST-1793167849602\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:10:50'),(164,1,'CREATE','FISH_BATCH','27',NULL,'{\"batch_no\":\"BATCH-P18-202610-684\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:10:50'),(165,1,'CREATE','INTERNAL_FEED_ISSUE','44',NULL,'{\"issue_no\":\"ISS-20261028-2318\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:10:50'),(166,1,'UPDATE','FISH_BATCH','27',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:10:50'),(167,1,'CREATE','FISH_HARVEST','27',NULL,'{\"harvest_no\":\"HRV-20261028-2242\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:10:50'),(168,1,'CREATE','FISH_HARVEST','28',NULL,'{\"harvest_no\":\"HRV-20261028-1880\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:10:50'),(169,1,'CREATE','FISH_BATCH','28',NULL,'{\"batch_no\":\"BATCH-P18-202610-593\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:10:50'),(170,1,'CREATE','EGG_COLLECTION','31',NULL,'{\"collection_no\":\"EGG-20261028-6044\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:10:50'),(171,1,'UPDATE','EGG_COLLECTION','31',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:10:50'),(172,1,'CREATE','INTERNAL_FEED_ISSUE','45',NULL,'{\"issue_no\":\"ISS-20261028-5717\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:10:51'),(173,1,'CREATE','INTERNAL_FEED_ISSUE','46',NULL,'{\"issue_no\":\"ISS-20261028-6044\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:10:51'),(174,1,'CREATE','PAYMENT_VOUCHER','PV-1793168385152',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:19:45'),(175,1,'CREATE','RECEIPT_VOUCHER','RV-1793168385311',NULL,'{\"customerId\":181,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:19:45'),(176,1,'CREATE','INTERNAL_FEED_ISSUE','47',NULL,'{\"issue_no\":\"ISS-20261028-2951\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-28 00:19:45'),(177,1,'CREATE','FISH_BATCH','29',NULL,'{\"batch_no\":\"BATCH-P19-202610-901\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-28 00:19:46'),(178,1,'CREATE','FISH_HARVEST','29',NULL,'{\"harvest_no\":\"HRV-20261028-6605\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-28 00:19:46'),(179,1,'CREATE','EGG_COLLECTION','32',NULL,'{\"collection_no\":\"EGG-20261028-3073\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-28 00:19:46'),(180,1,'CREATE','EGG_COLLECTION','33',NULL,'{\"collection_no\":\"EGG-20261028-4421\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:20:01'),(181,1,'CREATE','FISH_POND','20',NULL,'{\"pond_code\":\"POND-TEST-1793168401684\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:20:02'),(182,1,'CREATE','FISH_BATCH','30',NULL,'{\"batch_no\":\"BATCH-P20-202610-973\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:20:02'),(183,1,'CREATE','INTERNAL_FEED_ISSUE','48',NULL,'{\"issue_no\":\"ISS-20261028-2699\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:20:02'),(184,1,'UPDATE','FISH_BATCH','30',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:20:02'),(185,1,'CREATE','EGG_COLLECTION','34',NULL,'{\"collection_no\":\"EGG-20261028-8457\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:20:02'),(186,1,'CREATE','FISH_HARVEST','30',NULL,'{\"harvest_no\":\"HRV-20261028-4479\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:20:02'),(187,1,'UPDATE','EGG_COLLECTION','34',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:20:02'),(188,1,'CREATE','FISH_HARVEST','31',NULL,'{\"harvest_no\":\"HRV-20261028-7661\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:20:02'),(189,1,'CREATE','FISH_BATCH','31',NULL,'{\"batch_no\":\"BATCH-P20-202610-747\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:20:02'),(190,1,'CREATE','INTERNAL_FEED_ISSUE','49',NULL,'{\"issue_no\":\"ISS-20261028-8295\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:20:03'),(191,1,'CREATE','INTERNAL_FEED_ISSUE','50',NULL,'{\"issue_no\":\"ISS-20261028-6704\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:20:03'),(192,1,'CREATE','PAYMENT_VOUCHER','PV-1793168403154',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:20:03'),(193,1,'CREATE','RECEIPT_VOUCHER','RV-1793168403617',NULL,'{\"customerId\":186,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:20:04'),(194,1,'CREATE','INTERNAL_FEED_ISSUE','51',NULL,'{\"issue_no\":\"ISS-20261028-4544\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-28 00:20:04'),(195,1,'CREATE','FISH_BATCH','32',NULL,'{\"batch_no\":\"BATCH-P21-202610-859\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-28 00:20:04'),(196,1,'CREATE','FISH_HARVEST','32',NULL,'{\"harvest_no\":\"HRV-20261028-9190\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-28 00:20:04'),(197,1,'CREATE','EGG_COLLECTION','35',NULL,'{\"collection_no\":\"EGG-20261028-5318\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-28 00:20:04'),(198,1,'CREATE','EGG_COLLECTION','36',NULL,'{\"collection_no\":\"EGG-20261028-8023\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:21:23'),(199,1,'CREATE','FISH_POND','22',NULL,'{\"pond_code\":\"POND-TEST-1793168482898\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:21:23'),(200,1,'CREATE','FISH_BATCH','33',NULL,'{\"batch_no\":\"BATCH-P22-202610-295\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:21:23'),(201,1,'CREATE','INTERNAL_FEED_ISSUE','52',NULL,'{\"issue_no\":\"ISS-20261028-7104\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:21:23'),(202,1,'CREATE','EGG_COLLECTION','37',NULL,'{\"collection_no\":\"EGG-20261028-3185\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:21:23'),(203,1,'UPDATE','EGG_COLLECTION','37',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:21:23'),(204,1,'UPDATE','FISH_BATCH','33',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:21:23'),(205,1,'CREATE','FISH_HARVEST','33',NULL,'{\"harvest_no\":\"HRV-20261028-2828\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:21:23'),(206,1,'CREATE','FISH_HARVEST','34',NULL,'{\"harvest_no\":\"HRV-20261028-9110\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:21:23'),(207,1,'CREATE','FISH_BATCH','34',NULL,'{\"batch_no\":\"BATCH-P22-202610-202\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:21:23'),(208,1,'CREATE','INTERNAL_FEED_ISSUE','53',NULL,'{\"issue_no\":\"ISS-20261028-3553\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:21:24'),(209,1,'CREATE','INTERNAL_FEED_ISSUE','54',NULL,'{\"issue_no\":\"ISS-20261028-8132\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:21:24'),(210,1,'CREATE','PAYMENT_VOUCHER','PV-1793168483914',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:21:24'),(211,1,'CREATE','RECEIPT_VOUCHER','RV-1793168484092',NULL,'{\"customerId\":194,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:21:24'),(212,1,'CREATE','INTERNAL_FEED_ISSUE','55',NULL,'{\"issue_no\":\"ISS-20261028-1729\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-28 00:21:24'),(213,1,'CREATE','FISH_BATCH','35',NULL,'{\"batch_no\":\"BATCH-P23-202610-823\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-28 00:21:24'),(214,1,'CREATE','FISH_HARVEST','35',NULL,'{\"harvest_no\":\"HRV-20261028-4374\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-28 00:21:24'),(215,1,'CREATE','EGG_COLLECTION','38',NULL,'{\"collection_no\":\"EGG-20261028-7442\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-28 00:21:25'),(216,1,'CREATE','EGG_COLLECTION','39',NULL,'{\"collection_no\":\"EGG-20261028-8323\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:26:57'),(217,1,'CREATE','FISH_POND','24',NULL,'{\"pond_code\":\"POND-TEST-1793168817400\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:26:57'),(218,1,'CREATE','FISH_BATCH','36',NULL,'{\"batch_no\":\"BATCH-P24-202610-757\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:26:57'),(219,1,'CREATE','INTERNAL_FEED_ISSUE','56',NULL,'{\"issue_no\":\"ISS-20261028-6117\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:26:58'),(220,1,'UPDATE','FISH_BATCH','36',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:26:58'),(221,1,'CREATE','FISH_HARVEST','36',NULL,'{\"harvest_no\":\"HRV-20261028-2842\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:26:58'),(222,1,'CREATE','EGG_COLLECTION','40',NULL,'{\"collection_no\":\"EGG-20261028-5226\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:26:58'),(223,1,'UPDATE','EGG_COLLECTION','40',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:26:58'),(224,1,'CREATE','FISH_HARVEST','37',NULL,'{\"harvest_no\":\"HRV-20261028-6570\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:26:58'),(225,1,'CREATE','FISH_BATCH','37',NULL,'{\"batch_no\":\"BATCH-P24-202610-890\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:26:58'),(226,1,'CREATE','INTERNAL_FEED_ISSUE','57',NULL,'{\"issue_no\":\"ISS-20261028-3022\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:26:58'),(227,1,'CREATE','INTERNAL_FEED_ISSUE','58',NULL,'{\"issue_no\":\"ISS-20261028-2524\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:26:58'),(228,1,'CREATE','PAYMENT_VOUCHER','PV-1793168818396',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:26:58'),(229,1,'CREATE','RECEIPT_VOUCHER','RV-1793168818619',NULL,'{\"customerId\":202,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:26:59'),(230,1,'CREATE','INTERNAL_FEED_ISSUE','59',NULL,'{\"issue_no\":\"ISS-20261028-2526\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-28 00:26:59'),(231,1,'CREATE','FISH_BATCH','38',NULL,'{\"batch_no\":\"BATCH-P25-202610-380\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-28 00:26:59'),(232,1,'CREATE','FISH_HARVEST','38',NULL,'{\"harvest_no\":\"HRV-20261028-1707\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-28 00:26:59'),(233,1,'CREATE','EGG_COLLECTION','41',NULL,'{\"collection_no\":\"EGG-20261028-2432\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-28 00:26:59'),(234,1,'CREATE','EGG_COLLECTION','42',NULL,'{\"collection_no\":\"EGG-20261028-1947\",\"total_collected\":850,\"rejected\":20,\"accepted\":830,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:28:48'),(235,1,'CREATE','FISH_POND','26',NULL,'{\"pond_code\":\"POND-TEST-1793168928364\",\"pond_name\":\"North Pond 01\"}',NULL,NULL,'2026-10-28 00:28:48'),(236,1,'CREATE','FISH_BATCH','39',NULL,'{\"batch_no\":\"BATCH-P26-202610-283\",\"count\":5000,\"unit_cost\":2,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:28:48'),(237,1,'CREATE','INTERNAL_FEED_ISSUE','60',NULL,'{\"issue_no\":\"ISS-20261028-3344\",\"destination\":\"North Pond 01\",\"bags\":10,\"total_kg\":500,\"cost\":20000}',NULL,NULL,'2026-10-28 00:28:49'),(238,1,'UPDATE','FISH_BATCH','39',NULL,'{\"expenseCategory\":\"MEDICINE_AND_LIME\",\"amount\":2000,\"new_accumulated_other_expenses\":2000}',NULL,NULL,'2026-10-28 00:28:49'),(239,1,'CREATE','FISH_HARVEST','39',NULL,'{\"harvest_no\":\"HRV-20261028-2809\",\"fish_count\":1000,\"weight_kg\":850,\"cost_allocated\":6666.666666666667,\"cost_per_kg\":7.843137254901961}',NULL,NULL,'2026-10-28 00:28:49'),(240,1,'CREATE','EGG_COLLECTION','43',NULL,'{\"collection_no\":\"EGG-20261028-4641\",\"total_collected\":200,\"rejected\":0,\"accepted\":200,\"cost_per_egg\":5}',NULL,NULL,'2026-10-28 00:28:49'),(241,1,'UPDATE','EGG_COLLECTION','43',NULL,'{\"status\":\"REVERSED\",\"reason\":\"Counting error\"}',NULL,NULL,'2026-10-28 00:28:49'),(242,1,'CREATE','FISH_HARVEST','40',NULL,'{\"harvest_no\":\"HRV-20261028-7814\",\"fish_count\":3800,\"weight_kg\":3200,\"cost_allocated\":25333.33,\"cost_per_kg\":7.916665625}',NULL,NULL,'2026-10-28 00:28:49'),(243,1,'CREATE','FISH_BATCH','40',NULL,'{\"batch_no\":\"BATCH-P26-202610-744\",\"count\":2000,\"unit_cost\":5,\"total_cost\":10000}',NULL,NULL,'2026-10-28 00:28:49'),(244,1,'CREATE','INTERNAL_FEED_ISSUE','61',NULL,'{\"issue_no\":\"ISS-20261028-6685\",\"destination\":\"Pond 1 / Tilapia Batch 2\",\"bags\":2,\"total_kg\":100,\"cost\":4800}',NULL,NULL,'2026-10-28 00:28:49'),(245,1,'CREATE','PAYMENT_VOUCHER','PV-1793168929533',NULL,'{\"voucherType\":\"SUPPLIER_PAYMENT\",\"amount\":15000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:28:50'),(246,1,'CREATE','INTERNAL_FEED_ISSUE','62',NULL,'{\"issue_no\":\"ISS-20261028-2724\",\"destination\":\"Shed 1 / Layer Batch 5\",\"bags\":4,\"total_kg\":100,\"cost\":5200}',NULL,NULL,'2026-10-28 00:28:50'),(247,1,'CREATE','RECEIPT_VOUCHER','RV-1793168930312',NULL,'{\"customerId\":210,\"amount\":6000,\"paymentMethod\":\"Cash\",\"accountId\":1}',NULL,NULL,'2026-10-28 00:28:50'),(248,1,'CREATE','INTERNAL_FEED_ISSUE','63',NULL,'{\"issue_no\":\"ISS-20261028-5867\",\"destination\":\"Shed Accounting Test\",\"bags\":2,\"total_kg\":100,\"cost\":5000}',NULL,NULL,'2026-10-28 00:28:51'),(249,1,'CREATE','FISH_BATCH','41',NULL,'{\"batch_no\":\"BATCH-P27-202610-936\",\"count\":4000,\"unit_cost\":2,\"total_cost\":8000}',NULL,NULL,'2026-10-28 00:28:51'),(250,1,'CREATE','FISH_HARVEST','41',NULL,'{\"harvest_no\":\"HRV-20261028-5907\",\"fish_count\":1000,\"weight_kg\":700,\"cost_allocated\":2000,\"cost_per_kg\":2.857142857142857}',NULL,NULL,'2026-10-28 00:28:52'),(251,1,'CREATE','EGG_COLLECTION','44',NULL,'{\"collection_no\":\"EGG-20261028-9399\",\"total_collected\":300,\"rejected\":10,\"accepted\":290,\"cost_per_egg\":10}',NULL,NULL,'2026-10-28 00:28:53');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `brands_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (101,'Kazi Farms Group',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(102,'CP Bangladesh',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(103,'Nourish Poultry & Hatchery',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(104,'ACI Godrej Agrovet',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(105,'Paragon Feed & Poultry',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_units`
--

DROP TABLE IF EXISTS `business_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_units_code_key` (`code`),
  KEY `business_units_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_units`
--

LOCK TABLES `business_units` WRITE;
/*!40000 ALTER TABLE `business_units` DISABLE KEYS */;
INSERT INTO `business_units` VALUES (1,'EGG','Feed Trading Division','active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38'),(2,'FISH','পুকুরে মাছ চাষ (Own-Pond Fish Farming)','active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38'),(3,'FEED','পোল্ট্রি ও মাছের খাদ্য ব্যবসা (Poultry Feed Trading)','active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38'),(4,'GENERAL','সাধারণ ও কেন্দ্রীয় পরিচালনা (General Operations)','active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38');
/*!40000 ALTER TABLE `business_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cancelled_tiles`
--

DROP TABLE IF EXISTS `cancelled_tiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cancelled_tiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `order_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items_data` json NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_items` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_by` bigint unsigned DEFAULT NULL,
  `cancelled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cancelled_tiles_order_id_idx` (`order_id`),
  KEY `cancelled_tiles_created_at_idx` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancelled_tiles`
--

LOCK TABLES `cancelled_tiles` WRITE;
/*!40000 ALTER TABLE `cancelled_tiles` DISABLE KEYS */;
INSERT INTO `cancelled_tiles` VALUES (9,112,'ORD-20261027-2370',68,'Md Soriful Islam','01717015401','[{\"unit\": \"Box\", \"grade\": \"Grade A\", \"price\": 50, \"category\": \"Tiles\", \"quantity\": 0.4545454545454546, \"tile_size\": \"12\\\"x18\\\"\", \"line_total\": 27.27, \"product_id\": 494, \"pcs_per_box\": 11, \"product_code\": \"PRD-0494\", \"product_name\": \"test\", \"sqft_per_box\": 16.5, \"cancelled_pcs\": 5, \"selling_price\": 60, \"cancelled_boxes\": 0, \"order_detail_id\": 342, \"was_stock_returned\": true, \"stock_lifecycle_state\": \"DEDUCTED_AT_CHALLAN\"}]',27.27,0.45,NULL,1,'2026-10-27 06:06:28','2026-10-27 06:06:28','2026-10-27 06:06:28'),(10,115,'ORD-20261027-2809',1,'SAYEM','01742501636','[{\"unit\": \"Box\", \"grade\": \"Grade A\", \"price\": 50, \"category\": \"Tiles\", \"quantity\": 1.3636363636363635, \"tile_size\": \"12\\\"x18\\\"\", \"line_total\": 81.82, \"product_id\": 494, \"pcs_per_box\": 11, \"product_code\": \"PRD-0494\", \"product_name\": \"test\", \"sqft_per_box\": 16.5, \"cancelled_pcs\": 4, \"selling_price\": 60, \"cancelled_boxes\": 1, \"order_detail_id\": 346, \"was_stock_returned\": false, \"stock_lifecycle_state\": \"PENDING_CHALLAN\"}]',81.82,1.36,NULL,1,'2026-10-27 06:08:30','2026-10-27 06:08:30','2026-10-27 06:08:30'),(11,111,'ORD-20261026-7886',47,'Md Jony','01758449906','[{\"unit\": \"Box\", \"grade\": \"Grade A\", \"price\": 50, \"category\": \"Tiles\", \"quantity\": 0.09090909090909093, \"tile_size\": \"12\\\"x18\\\"\", \"line_total\": 5.45, \"product_id\": 494, \"pcs_per_box\": 11, \"product_code\": \"PRD-0494\", \"product_name\": \"test\", \"sqft_per_box\": 16.5, \"cancelled_pcs\": 1, \"selling_price\": 60, \"cancelled_boxes\": 0, \"order_detail_id\": 350, \"was_stock_returned\": false, \"stock_lifecycle_state\": \"PENDING_CHALLAN\"}]',5.45,0.09,NULL,1,'2026-10-27 06:16:08','2026-10-27 06:16:08','2026-10-27 06:16:08'),(12,111,'ORD-20261026-7886',47,'Md Jony','01758449906','[{\"unit\": \"Box\", \"grade\": \"Grade B\", \"price\": 513.3333, \"category\": \"Tiles\", \"quantity\": 0.3333333333333333, \"tile_size\": \"10\\\"x16\\\"\", \"line_total\": 233.33, \"product_id\": 488, \"pcs_per_box\": 15, \"product_code\": \"PRD-0488\", \"product_name\": \"B 1023BR\", \"sqft_per_box\": 16.66, \"cancelled_pcs\": 5, \"selling_price\": 700, \"cancelled_boxes\": 0, \"order_detail_id\": 335, \"was_stock_returned\": false, \"stock_lifecycle_state\": \"PENDING_CHALLAN\"}]',233.33,0.33,NULL,1,'2026-10-27 06:16:32','2026-10-27 06:16:32','2026-10-27 06:16:32'),(13,111,'ORD-20261026-7886',47,'Md Jony','01758449906','[{\"unit\": \"Box\", \"grade\": \"Grade A\", \"price\": 861, \"category\": \"Tiles\", \"quantity\": 1, \"tile_size\": \"12\\\"x12\\\"\", \"line_total\": 1008, \"product_id\": 492, \"pcs_per_box\": 16, \"product_code\": \"PRD-0492\", \"product_name\": \"3DP6040\", \"sqft_per_box\": 16, \"cancelled_pcs\": 0, \"selling_price\": 1008, \"cancelled_boxes\": 1, \"order_detail_id\": 349, \"was_stock_returned\": false, \"stock_lifecycle_state\": \"PENDING_CHALLAN\"}, {\"unit\": \"Box\", \"grade\": \"Grade A\", \"price\": 50, \"category\": \"Tiles\", \"quantity\": 1, \"tile_size\": \"12\\\"x18\\\"\", \"line_total\": 60, \"product_id\": 494, \"pcs_per_box\": 11, \"product_code\": \"PRD-0494\", \"product_name\": \"test\", \"sqft_per_box\": 16.5, \"cancelled_pcs\": 0, \"selling_price\": 60, \"cancelled_boxes\": 1, \"order_detail_id\": 350, \"was_stock_returned\": false, \"stock_lifecycle_state\": \"PENDING_CHALLAN\"}]',1068.00,2.00,NULL,1,'2026-10-27 06:16:59','2026-10-27 06:16:59','2026-10-27 06:16:59');
/*!40000 ALTER TABLE `cancelled_tiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categories_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (101,'Poultry Feed',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(102,'Poultry Eggs',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(103,'Fisheries & Aqua',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(104,'Day-Old Chicks',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(105,'Veterinary Medicine',NULL,'active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `challan_items`
--

DROP TABLE IF EXISTS `challan_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challan_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `challan_id` bigint unsigned NOT NULL,
  `order_detail_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `challan_items_challan_id_foreign` (`challan_id`),
  KEY `challan_items_order_detail_id_foreign` (`order_detail_id`),
  KEY `challan_items_product_id_foreign` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challan_items`
--

LOCK TABLES `challan_items` WRITE;
/*!40000 ALTER TABLE `challan_items` DISABLE KEYS */;
INSERT INTO `challan_items` VALUES (1,1,10,6,'6PGVT03','PRD-0006',75.00,'Box','2026-10-15 04:07:48','2026-10-15 04:07:48'),(2,2,11,245,'2056BR','PRD-0245',57.00,'Box','2026-10-15 04:15:45','2026-10-15 04:15:45'),(3,3,12,245,'2056BR','PRD-0245',7.60,'Box','2026-10-15 04:29:33','2026-10-15 04:29:33'),(4,4,16,278,'2065DBR','PRD-0278',5.80,'Box','2026-10-15 09:23:59','2026-10-15 09:23:59'),(5,4,17,279,'2065LBR','PRD-0279',4.32,'Box','2026-10-15 09:23:59','2026-10-15 09:23:59'),(6,4,18,280,'W206501','PRD-0280',1.08,'Box','2026-10-15 09:23:59','2026-10-15 09:23:59'),(7,5,20,366,'6PGVT61','PRD-0366',2.50,'Box','2026-10-17 03:07:04','2026-10-17 03:07:04'),(8,5,21,63,'4HG54','PRD-0063',45.33,'Box','2026-10-17 03:07:04','2026-10-17 03:07:04'),(9,5,22,361,'2038DBR','PRD-0361',5.00,'Box','2026-10-17 03:07:04','2026-10-17 03:07:04'),(10,5,23,362,'2038LBR','PRD-0362',4.20,'Box','2026-10-17 03:07:04','2026-10-17 03:07:04'),(11,5,24,363,'W203801','PRD-0363',1.00,'Box','2026-10-17 03:07:04','2026-10-17 03:07:04'),(12,5,25,367,'12/12 PARKING','PRD-0367',100.00,'Pcs','2026-10-17 03:07:04','2026-10-17 03:07:04'),(13,6,26,248,'2108DG','PRD-0248',6.00,'Box','2026-10-17 03:10:04','2026-10-17 03:10:04'),(14,6,27,64,'4HG36','PRD-0064',3.44,'Box','2026-10-17 03:10:04','2026-10-17 03:10:04'),(15,7,28,7,'6PGVT59','PRD-0007',13.00,'Box','2026-10-17 03:29:33','2026-10-17 03:29:33'),(16,8,29,59,'4HF10','PRD-0059',2.00,'Box','2026-10-17 03:40:13','2026-10-17 03:40:13'),(17,8,30,278,'2065DBR','PRD-0278',4.08,'Box','2026-10-17 03:40:13','2026-10-17 03:40:13'),(18,8,31,279,'2065LBR','PRD-0279',3.20,'Box','2026-10-17 03:40:13','2026-10-17 03:40:13'),(19,8,32,280,'W206501','PRD-0280',0.80,'Box','2026-10-17 03:40:13','2026-10-17 03:40:13'),(20,9,34,223,'12/24 3DWALL','PRD-0223',1.00,'Pcs','2026-10-17 04:45:10','2026-10-17 04:45:10'),(21,10,35,371,'P118','PRD-0371',11.00,'Box','2026-10-17 04:58:06','2026-10-17 04:58:06'),(22,11,36,6,'6PGVT03','PRD-0006',1.00,'Box','2026-10-17 04:59:49','2026-10-17 04:59:49'),(23,12,37,300,'2082GY','PRD-0300',27.00,'Box','2026-10-17 05:52:32','2026-10-17 05:52:32'),(24,12,38,387,'B 2000BR','PRD-0387',6.00,'Box','2026-10-17 05:52:32','2026-10-17 05:52:32'),(25,13,39,395,'4003LGY','PRD-0395',8.00,'Box','2026-10-17 07:32:28','2026-10-17 07:32:28'),(26,13,40,396,'W400301','PRD-0396',1.00,'Box','2026-10-17 07:32:28','2026-10-17 07:32:28'),(27,13,41,378,'5019DGY','PRD-0378',5.20,'Box','2026-10-17 07:32:28','2026-10-17 07:32:28'),(28,13,42,379,'5019LGY','PRD-0379',5.10,'Box','2026-10-17 07:32:28','2026-10-17 07:32:28'),(29,13,43,380,'W501901','PRD-0380',1.70,'Box','2026-10-17 07:32:28','2026-10-17 07:32:28'),(30,14,44,246,'2028BR','PRD-0246',1.00,'Box','2026-10-17 07:35:39','2026-10-17 07:35:39'),(31,15,45,134,'W604001','PRD-0134',0.13,'Box','2026-10-17 07:54:43','2026-10-17 07:54:43'),(32,16,46,10,'6PGVT29','PRD-0010',15.75,'Box','2026-10-17 08:13:21','2026-10-17 08:13:21'),(33,17,48,60,'4HG23','PRD-0060',12.55,'Box','2026-10-17 08:37:04','2026-10-17 08:37:04'),(34,17,49,261,'2040L','PRD-0261',2.24,'Box','2026-10-17 08:37:04','2026-10-17 08:37:04'),(35,18,53,278,'2065DBR','PRD-0278',21.00,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(36,18,54,279,'2065LBR','PRD-0279',16.00,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(37,18,55,280,'W206501','PRD-0280',4.00,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(38,18,56,268,'2045DB','PRD-0268',8.80,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(39,18,57,269,'2045LB','PRD-0269',6.56,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(40,18,58,271,'W204502','PRD-0271',1.64,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(41,18,59,73,'4DP13','PRD-0073',10.00,'Box','2026-10-17 10:17:07','2026-10-17 10:17:07'),(42,19,60,75,'4HG19','PRD-0075',33.00,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(43,19,61,415,'B 2086DGY','PRD-0415',11.76,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(44,19,62,416,'B 2086LGY','PRD-0416',8.80,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(45,19,63,414,'B W208601','PRD-0414',0.80,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(46,19,64,413,'B W208602','PRD-0413',1.32,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(47,19,65,407,'B 2065DBR','PRD-0407',3.88,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(48,19,66,408,'B 2065LBR','PRD-0408',2.88,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(49,19,67,409,'B W206501','PRD-0409',0.72,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(50,19,68,285,'2015DGY','PRD-0285',1.28,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(51,19,69,286,'2015LGY','PRD-0286',1.00,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(52,19,70,287,'W201501','PRD-0287',0.24,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(53,19,71,59,'4HF10','PRD-0059',4.44,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(54,19,72,450,'B 6PGVT01BK','PRD-0450',1.25,'Box','2026-10-17 11:17:25','2026-10-17 11:17:25'),(55,20,73,415,'B 2086DGY','PRD-0415',4.48,'Box','2026-10-17 11:22:18','2026-10-17 11:22:18'),(56,20,74,416,'B 2086LGY','PRD-0416',3.40,'Box','2026-10-17 11:22:18','2026-10-17 11:22:18'),(57,20,75,414,'B W208601','PRD-0414',0.80,'Box','2026-10-17 11:22:18','2026-10-17 11:22:18'),(58,20,76,59,'4HF10','PRD-0059',2.00,'Box','2026-10-17 11:22:18','2026-10-17 11:22:18'),(59,21,84,458,'B 6PGVT62','PRD-0458',0.25,'Box','2026-10-18 06:02:32','2026-10-18 06:02:32'),(60,22,85,366,'6PGVT61','PRD-0366',0.25,'Box','2026-10-18 06:22:39','2026-10-18 06:22:39'),(61,23,86,301,'2083CBK','PRD-0301',21.00,'Box','2026-10-18 06:32:56','2026-10-18 06:32:56'),(62,23,87,365,'6PGVT01BK','PRD-0365',0.50,'Box','2026-10-18 06:32:56','2026-10-18 06:32:56'),(63,23,88,475,'6PGVT01','PRD-0475',0.50,'Box','2026-10-18 06:32:56','2026-10-18 06:32:56'),(64,24,89,10,'6PGVT29','PRD-0010',3.00,'Box','2026-10-18 06:35:40','2026-10-18 06:35:40'),(65,25,90,330,'2098DGY','PRD-0330',7.80,'Box','2026-10-18 07:15:47','2026-10-18 07:15:47'),(66,25,91,331,'2098LGY','PRD-0331',5.76,'Box','2026-10-18 07:15:47','2026-10-18 07:15:47'),(67,25,92,332,'W209801','PRD-0332',1.44,'Box','2026-10-18 07:15:47','2026-10-18 07:15:47'),(68,25,93,59,'4HF10','PRD-0059',4.00,'Box','2026-10-18 07:15:47','2026-10-18 07:15:47'),(69,26,97,13,'6PGVT40','PRD-0013',14.00,'Box','2026-10-18 07:23:19','2026-10-18 07:23:19'),(70,26,98,73,'4DP13','PRD-0073',4.44,'Box','2026-10-18 07:23:19','2026-10-18 07:23:19'),(71,26,99,342,'2107DGR','PRD-0342',0.20,'Box','2026-10-18 07:23:19','2026-10-18 07:23:19'),(72,26,100,59,'4HF10','PRD-0059',0.44,'Box','2026-10-18 07:23:19','2026-10-18 07:23:19'),(73,27,101,5,'6PGVT12','PRD-0005',4.50,'Box','2026-10-18 07:42:30','2026-10-18 07:42:30'),(74,27,102,92,'6004PGY','PRD-0092',0.75,'Box','2026-10-18 07:42:30','2026-10-18 07:42:30'),(75,27,103,368,'P110','PRD-0368',2.08,'Box','2026-10-18 07:42:30','2026-10-18 07:42:30'),(76,28,106,247,'2066DBR','PRD-0247',27.00,'Box','2026-10-18 08:42:34','2026-10-18 08:42:34'),(77,28,107,354,'2000BK','PRD-0354',4.48,'Box','2026-10-18 08:42:34','2026-10-18 08:42:34'),(78,29,111,481,'6PGVT13','PRD-0481',75.00,'Box','2026-10-18 09:34:16','2026-10-18 09:34:16'),(79,29,112,278,'2065DBR','PRD-0278',3.60,'Box','2026-10-18 09:34:16','2026-10-18 09:34:16'),(80,29,113,279,'2065LBR','PRD-0279',2.88,'Box','2026-10-18 09:34:16','2026-10-18 09:34:16'),(81,29,114,281,'W206502','PRD-0281',0.72,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(82,29,115,306,'2070DIV','PRD-0306',15.00,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(83,29,116,307,'2070LIV','PRD-0307',12.00,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(84,29,117,308,'W207001','PRD-0308',3.00,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(85,29,118,248,'2108DG','PRD-0248',31.40,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(86,29,119,59,'4HF10','PRD-0059',7.00,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(87,29,120,365,'6PGVT01BK','PRD-0365',4.25,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(88,29,122,79,'3HF10STP','PRD-0079',4.38,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(89,29,123,76,'3HF10','PRD-0076',2.00,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(90,29,124,114,'6036DTL','PRD-0114',0.88,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(91,29,125,115,'6036LTL','PRD-0115',0.88,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(92,29,126,116,'W603601','PRD-0116',0.50,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(93,29,127,351,'2113DGL','PRD-0351',0.52,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(94,29,128,352,'2113LGL','PRD-0352',0.64,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(95,29,129,353,'W211301','PRD-0353',0.16,'Box','2026-10-18 09:34:17','2026-10-18 09:34:17'),(96,30,130,97,'6012DGR','PRD-0097',4.25,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(97,30,131,98,'6012LGR','PRD-0098',4.25,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(98,30,132,99,'W601201','PRD-0099',1.50,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(99,30,133,84,'3DP6012','PRD-0084',3.00,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(100,30,134,92,'6004PGY','PRD-0092',8.50,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(101,30,135,93,'W600401','PRD-0093',1.50,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(102,30,136,91,'3DP6004P','PRD-0091',3.00,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(103,30,137,388,'5015DGY','PRD-0388',3.80,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(104,30,138,389,'5015LGY','PRD-0389',3.80,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(105,30,139,390,'W501501','PRD-0390',1.40,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(106,30,140,90,'3DP5015P','PRD-0090',2.63,'Box','2026-10-18 10:07:22','2026-10-18 10:07:22'),(107,30,141,107,'W603102','PRD-0107',1.50,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(108,30,142,104,'6031DBR','PRD-0104',4.88,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(109,30,143,105,'6031LBR','PRD-0105',4.88,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(110,30,144,429,'B 12PGVT14','PRD-0429',2.00,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(111,30,145,1,'6PGVT46','PRD-0001',4.00,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(112,30,146,94,'6013DBR','PRD-0094',1.38,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(113,30,147,95,'6013LBR','PRD-0095',1.38,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(114,30,148,96,'W601301','PRD-0096',0.38,'Box','2026-10-18 10:07:23','2026-10-18 10:07:23'),(115,31,149,358,'2057PBL','PRD-0358',1.00,'Box','2026-10-18 10:09:47','2026-10-18 10:09:47'),(116,32,150,353,'W211301','PRD-0353',0.68,'Box','2026-10-18 11:48:40','2026-10-18 11:48:40'),(117,32,151,352,'2113LGL','PRD-0352',2.72,'Box','2026-10-18 11:48:40','2026-10-18 11:48:40'),(118,32,152,351,'2113DGL','PRD-0351',3.80,'Box','2026-10-18 11:48:40','2026-10-18 11:48:40'),(119,33,153,59,'4HF10','PRD-0059',0.22,'Box','2026-10-18 11:51:25','2026-10-18 11:51:25'),(120,34,154,76,'3HF10','PRD-0076',1.25,'Box','2026-10-19 04:09:34','2026-10-19 04:09:34'),(121,34,155,291,'2025LGY','PRD-0291',1.00,'Box','2026-10-19 04:09:34','2026-10-19 04:09:34'),(122,35,157,1,'6PGVT46','PRD-0001',2.50,'Box','2026-10-19 04:11:36','2026-10-19 04:11:36'),(123,36,158,135,'6043DGR','PRD-0135',0.75,'Box','2026-10-19 04:13:07','2026-10-19 04:13:07'),(124,37,159,376,'30608 RZ','PRD-0376',2.33,'Box','2026-10-19 04:15:51','2026-10-19 04:15:51'),(125,38,162,291,'2025LGY','PRD-0291',0.24,'Box','2026-10-19 04:21:53','2026-10-19 04:21:53'),(126,39,164,482,'6PGVT45','PRD-0482',125.00,'Box','2026-10-19 05:58:52','2026-10-19 05:58:52'),(127,40,165,8,'6PGVT55','PRD-0008',44.00,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(128,40,166,253,'2106DGY','PRD-0253',4.60,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(129,40,167,254,'2106LGY','PRD-0254',3.52,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(130,40,168,255,'W210601','PRD-0255',0.88,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(131,40,169,287,'W201501','PRD-0287',0.88,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(132,40,170,286,'2015LGY','PRD-0286',3.52,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(133,40,171,285,'2015DGY','PRD-0285',4.60,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(134,40,172,59,'4HF10','PRD-0059',4.00,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(135,40,173,247,'2066DBR','PRD-0247',3.00,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(136,40,174,342,'2107DGR','PRD-0342',7.80,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(137,40,175,343,'2107LGR','PRD-0343',5.60,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(138,40,176,344,'W210701','PRD-0344',1.40,'Box','2026-10-19 08:45:50','2026-10-19 08:45:50'),(139,41,177,5,'6PGVT12','PRD-0005',57.00,'Box','2026-10-19 08:56:32','2026-10-19 08:56:32'),(140,42,179,8,'6PGVT55','PRD-0008',4.00,'Box','2026-10-19 10:23:14','2026-10-19 10:23:14'),(141,43,181,484,'1022GY','PRD-0484',14.01,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(142,43,182,429,'B 12PGVT14','PRD-0429',3.50,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(143,43,183,316,'W208602','PRD-0316',1.24,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(144,43,184,314,'2086LGY','PRD-0314',5.00,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(145,43,185,313,'2086DGY','PRD-0313',6.76,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(146,43,186,134,'W604001','PRD-0134',0.50,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(147,43,187,132,'6040DGY','PRD-0132',1.75,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(148,43,188,133,'6040LGY','PRD-0133',1.75,'Box','2026-10-19 11:11:13','2026-10-19 11:11:13'),(149,44,189,9,'6PGVT47','PRD-0009',7.25,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(150,44,190,127,'W600502','PRD-0127',1.00,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(151,44,191,470,'B 6005LBR','PRD-0470',2.88,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(152,44,192,469,'B 6005DBR','PRD-0469',3.00,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(153,44,193,396,'W400301','PRD-0396',0.36,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(154,44,194,395,'4003LGY','PRD-0395',1.09,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(155,44,195,394,'4003DGY','PRD-0394',1.09,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(156,44,196,315,'W208601','PRD-0315',0.88,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(157,44,197,314,'2086LGY','PRD-0314',3.52,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(158,44,198,313,'2086DGY','PRD-0313',4.60,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(159,44,199,67,'4HG25','PRD-0067',2.44,'Box','2026-10-19 11:21:02','2026-10-19 11:21:02'),(160,45,200,484,'1022GY','PRD-0484',5.40,'Box','2026-10-19 11:23:49','2026-10-19 11:23:49'),(161,46,201,407,'B 2065DBR','PRD-0407',2.00,'Box','2026-10-20 02:00:46','2026-10-20 02:00:46'),(162,46,202,408,'B 2065LBR','PRD-0408',1.00,'Box','2026-10-20 02:00:46','2026-10-20 02:00:46'),(163,46,203,76,'3HF10','PRD-0076',2.00,'Box','2026-10-20 02:00:46','2026-10-20 02:00:46'),(164,47,204,343,'2107LGR','PRD-0343',2.00,'Box','2026-10-20 02:22:35','2026-10-20 02:22:35'),(165,47,205,7,'6PGVT59','PRD-0007',1.50,'Box','2026-10-20 02:22:35','2026-10-20 02:22:35'),(166,47,206,486,'6DC CBR','PRD-0486',1.00,'Box','2026-10-20 02:22:35','2026-10-20 02:22:35'),(167,48,207,326,'2092DGY','PRD-0326',19.32,'Box','2026-10-20 02:44:49','2026-10-20 02:44:49'),(168,48,208,327,'2092LGY','PRD-0327',18.00,'Box','2026-10-20 02:44:49','2026-10-20 02:44:49'),(169,48,209,328,'W209201','PRD-0328',2.68,'Box','2026-10-20 02:44:49','2026-10-20 02:44:49'),(170,49,210,413,'B W208602','PRD-0413',0.92,'Box','2026-10-20 03:33:45','2026-10-20 03:33:45'),(171,49,211,415,'B 2086DGY','PRD-0415',5.00,'Box','2026-10-20 03:33:45','2026-10-20 03:33:45'),(172,49,212,416,'B 2086LGY','PRD-0416',3.68,'Box','2026-10-20 03:33:45','2026-10-20 03:33:45'),(173,49,213,409,'B W206501','PRD-0409',0.80,'Box','2026-10-20 03:33:45','2026-10-20 03:33:45'),(174,49,214,407,'B 2065DBR','PRD-0407',4.40,'Box','2026-10-20 03:33:45','2026-10-20 03:33:45'),(175,49,215,408,'B 2065LBR','PRD-0408',3.20,'Box','2026-10-20 03:33:45','2026-10-20 03:33:45'),(176,50,217,433,'B 4HF12','PRD-0433',9.00,'Box','2026-10-20 05:13:47','2026-10-20 05:13:47'),(177,51,218,281,'W206502','PRD-0281',0.88,'Box','2026-10-20 05:29:34','2026-10-20 05:29:34'),(178,51,219,280,'W206501','PRD-0280',1.44,'Box','2026-10-20 05:29:34','2026-10-20 05:29:34'),(179,51,220,279,'2065LBR','PRD-0279',9.28,'Box','2026-10-20 05:29:34','2026-10-20 05:29:34'),(180,51,221,278,'2065DBR','PRD-0278',12.40,'Box','2026-10-20 05:29:34','2026-10-20 05:29:34'),(181,52,222,419,'B W201601','PRD-0419',2.20,'Box','2026-10-20 05:39:58','2026-10-20 05:39:58'),(182,52,223,418,'B 2016LBE','PRD-0418',8.80,'Box','2026-10-20 05:39:58','2026-10-20 05:39:58'),(183,52,224,417,'B 2016DBE','PRD-0417',12.00,'Box','2026-10-20 05:39:58','2026-10-20 05:39:58'),(184,52,225,457,'B W203601','PRD-0457',0.68,'Box','2026-10-20 05:39:58','2026-10-20 05:39:58'),(185,52,226,455,'B 2036DP','PRD-0455',3.60,'Box','2026-10-20 05:39:58','2026-10-20 05:39:58'),(186,52,227,456,'B 2036LP','PRD-0456',2.72,'Box','2026-10-20 05:39:58','2026-10-20 05:39:58'),(187,53,228,13,'6PGVT40','PRD-0013',2.25,'Box','2026-10-20 06:12:32','2026-10-20 06:12:32'),(188,54,233,8,'6PGVT55','PRD-0008',15.25,'Box','2026-10-20 09:10:36','2026-10-20 09:10:36'),(189,54,234,258,'2005BY','PRD-0258',3.20,'Box','2026-10-20 09:10:36','2026-10-20 09:10:36'),(190,54,235,354,'2000BK','PRD-0354',0.40,'Box','2026-10-20 09:10:36','2026-10-20 09:10:36'),(191,54,236,412,'B 2000W','PRD-0412',0.40,'Box','2026-10-20 09:10:36','2026-10-20 09:10:36'),(192,55,238,114,'6036DTL','PRD-0114',20.00,'Box','2026-10-20 09:22:09','2026-10-20 09:22:09'),(193,55,239,115,'6036LTL','PRD-0115',20.00,'Box','2026-10-20 09:22:09','2026-10-20 09:22:09'),(194,55,240,116,'W603601','PRD-0116',7.00,'Box','2026-10-20 09:22:09','2026-10-20 09:22:09'),(195,55,241,89,'3DP6036P','PRD-0089',11.56,'Box','2026-10-20 09:22:09','2026-10-20 09:22:09'),(196,56,242,489,'4020DP','PRD-0489',5.00,'Box','2026-10-20 09:26:36','2026-10-20 09:26:36'),(197,56,243,490,'4020LP','PRD-0490',5.00,'Box','2026-10-20 09:26:36','2026-10-20 09:26:36'),(198,56,244,491,'W402001','PRD-0491',2.00,'Box','2026-10-20 09:26:36','2026-10-20 09:26:36'),(199,56,245,118,'6038LBR','PRD-0118',0.88,'Box','2026-10-20 09:26:36','2026-10-20 09:26:36'),(200,56,246,378,'5019DGY','PRD-0378',0.70,'Box','2026-10-20 09:26:36','2026-10-20 09:26:36'),(201,57,247,300,'2082GY','PRD-0300',13.00,'Box','2026-10-20 10:49:03','2026-10-20 10:49:03'),(202,58,249,5,'6PGVT12','PRD-0005',12.00,'Box','2026-10-20 10:52:38','2026-10-20 10:52:38'),(203,59,250,452,'B W204901','PRD-0452',2.40,'Box','2026-10-20 10:56:02','2026-10-20 10:56:02'),(204,59,251,451,'B 2049LIV','PRD-0451',22.80,'Box','2026-10-20 10:56:02','2026-10-20 10:56:02'),(205,60,252,1,'6PGVT46','PRD-0001',23.00,'Box','2026-10-20 11:17:38','2026-10-20 11:17:38'),(206,60,253,344,'W210701','PRD-0344',0.88,'Box','2026-10-20 11:17:38','2026-10-20 11:17:38'),(207,60,254,343,'2107LGR','PRD-0343',3.40,'Box','2026-10-20 11:17:38','2026-10-20 11:17:38'),(208,60,255,342,'2107DGR','PRD-0342',4.72,'Box','2026-10-20 11:17:38','2026-10-20 11:17:38'),(209,60,256,278,'2065DBR','PRD-0278',1.12,'Box','2026-10-20 11:17:38','2026-10-20 11:17:38'),(210,61,259,255,'W210601','PRD-0255',3.00,'Box','2026-10-20 11:33:27','2026-10-20 11:33:27'),(211,62,260,482,'6PGVT45','PRD-0482',25.00,'Box','2026-10-20 11:51:11','2026-10-20 11:51:11'),(212,62,261,433,'B 4HF12','PRD-0433',4.00,'Box','2026-10-20 11:51:11','2026-10-20 11:51:11'),(213,62,262,412,'B 2000W','PRD-0412',0.60,'Box','2026-10-20 11:51:11','2026-10-20 11:51:11'),(214,62,263,354,'2000BK','PRD-0354',0.60,'Box','2026-10-20 11:51:11','2026-10-20 11:51:11'),(215,63,237,223,'12/24 3DWALL','PRD-0223',2.00,'Pcs','2026-10-21 03:01:18','2026-10-21 03:01:18'),(216,64,264,69,'4HG44','PRD-0069',23.00,'Box','2026-10-21 05:04:24','2026-10-21 05:04:24'),(217,64,265,66,'4HG45','PRD-0066',16.00,'Box','2026-10-21 05:04:24','2026-10-21 05:04:24'),(218,65,267,10,'6PGVT29','PRD-0010',3.50,'Box','2026-10-21 05:07:42','2026-10-21 05:07:42'),(219,66,268,1,'6PGVT46','PRD-0001',101.00,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(220,66,269,287,'W201501','PRD-0287',3.36,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(221,66,270,286,'2015LGY','PRD-0286',13.44,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(222,66,271,285,'2015DGY','PRD-0285',18.20,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(223,66,272,59,'4HF10','PRD-0059',9.00,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(224,66,273,344,'W210701','PRD-0344',2.00,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(225,66,274,343,'2107LGR','PRD-0343',8.00,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(226,66,275,342,'2107DGR','PRD-0342',11.00,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(227,66,276,431,'B 6PGVT61','PRD-0431',3.50,'Box','2026-10-21 05:22:31','2026-10-21 05:22:31'),(228,67,277,354,'2000BK','PRD-0354',2.40,'Box','2026-10-21 05:26:45','2026-10-21 05:26:45'),(229,68,278,359,'2058LBK','PRD-0359',1.20,'Box','2026-10-21 05:29:20','2026-10-21 05:29:20'),(230,69,279,435,'B 3DP5013','PRD-0435',0.19,'Box','2026-10-21 05:43:32','2026-10-21 05:43:32'),(231,70,285,248,'2108DG','PRD-0248',2.00,'Box','2026-10-21 09:03:14','2026-10-21 09:03:14'),(232,71,286,386,'W501801','PRD-0386',0.40,'Box','2026-10-21 09:08:16','2026-10-21 09:08:16'),(233,71,287,385,'5018LBR','PRD-0385',0.40,'Box','2026-10-21 09:08:16','2026-10-21 09:08:16'),(234,71,288,384,'5018DBR','PRD-0384',0.10,'Box','2026-10-21 09:08:16','2026-10-21 09:08:16'),(235,71,289,366,'6PGVT61','PRD-0366',0.50,'Box','2026-10-21 09:08:16','2026-10-21 09:08:16'),(236,71,290,73,'4DP13','PRD-0073',0.67,'Box','2026-10-21 09:08:16','2026-10-21 09:08:16'),(237,71,291,125,'6005LBR','PRD-0125',0.75,'Box','2026-10-21 09:08:16','2026-10-21 09:08:16'),(238,72,292,59,'4HF10','PRD-0059',11.78,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(239,72,293,256,'2004BL','PRD-0256',4.00,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(240,72,294,341,'W210101','PRD-0341',1.00,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(241,72,295,340,'2101LGR','PRD-0340',4.00,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(242,72,296,339,'2101DGR','PRD-0339',5.20,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(243,72,297,344,'W210701','PRD-0344',0.72,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(244,72,298,343,'2107LGR','PRD-0343',3.20,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(245,72,299,342,'2107DGR','PRD-0342',4.48,'Box','2026-10-21 09:31:42','2026-10-21 09:31:42'),(246,73,301,227,'12/24 2PCS KALEMA','PRD-0227',1.00,'Pcs','2026-10-21 10:06:47','2026-10-21 10:06:47'),(247,74,302,278,'2065DBR','PRD-0278',5.00,'Box','2026-10-21 10:08:29','2026-10-21 10:08:29'),(248,74,303,281,'W206502','PRD-0281',0.72,'Box','2026-10-21 10:08:29','2026-10-21 10:08:29'),(249,75,304,270,'W204501','PRD-0270',0.40,'Box','2026-10-21 10:17:30','2026-10-21 10:17:30'),(250,75,305,269,'2045LB','PRD-0269',0.60,'Box','2026-10-21 10:17:30','2026-10-21 10:17:30'),(251,75,306,268,'2045DB','PRD-0268',0.88,'Box','2026-10-21 10:17:30','2026-10-21 10:17:30'),(252,76,307,315,'W208601','PRD-0315',0.92,'Box','2026-10-21 10:50:59','2026-10-21 10:50:59'),(253,76,308,314,'2086LGY','PRD-0314',3.68,'Box','2026-10-21 10:50:59','2026-10-21 10:50:59'),(254,76,309,313,'2086DGY','PRD-0313',5.00,'Box','2026-10-21 10:50:59','2026-10-21 10:50:59'),(255,76,310,59,'4HF10','PRD-0059',2.22,'Box','2026-10-21 10:50:59','2026-10-21 10:50:59'),(256,77,229,9,'6PGVT47','PRD-0009',35.00,'Box','2026-10-21 10:59:28','2026-10-21 10:59:28'),(257,77,230,137,'W604301','PRD-0137',2.00,'Box','2026-10-21 10:59:28','2026-10-21 10:59:28'),(258,77,231,136,'6043LGR','PRD-0136',6.00,'Box','2026-10-21 10:59:28','2026-10-21 10:59:28'),(259,77,232,135,'6043DGR','PRD-0135',6.00,'Box','2026-10-21 10:59:28','2026-10-21 10:59:28'),(260,78,312,76,'3HF10','PRD-0076',27.00,'Box','2026-10-22 02:55:45','2026-10-22 02:55:45'),(261,78,313,80,'2HF10STP','PRD-0080',19.00,'Box','2026-10-22 02:55:45','2026-10-22 02:55:45'),(262,78,314,373,'P120','PRD-0373',6.00,'Box','2026-10-22 02:55:45','2026-10-22 02:55:45'),(263,79,315,408,'B 2065LBR','PRD-0408',0.40,'Box','2026-10-22 03:03:44','2026-10-22 03:03:44'),(264,80,316,354,'2000BK','PRD-0354',1.48,'Box','2026-10-22 03:42:03','2026-10-22 03:42:03'),(265,81,317,494,'test','PRD-0494',2.00,'Box','2026-10-26 01:56:19','2026-10-26 01:56:19'),(266,82,318,494,'test','PRD-0494',1.00,'Box','2026-10-26 02:13:20','2026-10-26 02:13:20'),(267,83,342,494,'test','PRD-0494',0.55,'Box','2026-10-26 23:39:13','2026-10-26 23:39:13');
/*!40000 ALTER TABLE `challan_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `challans`
--

DROP TABLE IF EXISTS `challans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `challan_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `challan_date` date NOT NULL DEFAULT (curdate()),
  `delivery_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DELIVERED',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `challans_challan_no_unique` (`challan_no`),
  UNIQUE KEY `challans_order_id_unique` (`order_id`),
  KEY `challans_customer_id_foreign` (`customer_id`),
  KEY `challans_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challans`
--

LOCK TABLES `challans` WRITE;
/*!40000 ALTER TABLE `challans` DISABLE KEYS */;
INSERT INTO `challans` VALUES (1,'CHL-20261015-9746',8,8,'2026-10-15','Dopaghata,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-15 04:07:48','2026-10-15 04:07:48'),(2,'CHL-20261015-4800',9,9,'2026-10-15','Atgoria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-15 04:15:45','2026-10-15 04:15:45'),(3,'CHL-20261015-6081',10,9,'2026-10-15','Atgoria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-15 04:29:33','2026-10-15 04:29:33'),(4,'CHL-20261015-5973',14,11,'2026-10-15','Chobaria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-15 09:23:59','2026-10-15 09:23:59'),(5,'CHL-20261017-1107',15,12,'2026-10-17','ATIKULA BAZAR',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 03:07:04','2026-10-17 03:07:04'),(6,'CHL-20261017-9825',16,13,'2026-10-17','ATIKULA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 03:10:04','2026-10-17 03:10:04'),(7,'CHL-20261017-8191',17,14,'2026-10-17','SALGARIA TALBAGAN',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 03:29:33','2026-10-17 03:29:33'),(8,'CHL-20261017-3039',18,15,'2026-10-17','MALIGASA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 03:40:13','2026-10-17 03:40:13'),(9,'CHL-20261017-1199',19,16,'2026-10-17','DAPUNIA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 04:45:10','2026-10-17 04:45:10'),(10,'CHL-20261017-9334',20,5,'2026-10-17',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 04:58:06','2026-10-17 04:58:06'),(11,'CHL-20261017-8616',21,10,'2026-10-17',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 04:59:49','2026-10-17 04:59:49'),(12,'CHL-20261017-2136',22,16,'2026-10-17','DAPUNIA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 05:52:32','2026-10-17 05:52:32'),(13,'CHL-20261017-2927',23,3,'2026-10-17','Autapara,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 07:32:28','2026-10-17 07:32:28'),(14,'CHL-20261017-4770',24,17,'2026-10-17','TEBUNIA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 07:35:39','2026-10-17 07:35:39'),(15,'CHL-20261017-5519',25,18,'2026-10-17','SALGARIA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 07:54:43','2026-10-17 07:54:43'),(16,'CHL-20261017-6799',26,19,'2026-10-17','PATKIABARI,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 08:13:21','2026-10-17 08:13:21'),(17,'CHL-20261017-9630',27,20,'2026-10-17','HAJIR HAT,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 08:37:04','2026-10-17 08:37:04'),(18,'CHL-20261017-9380',29,22,'2026-10-17','MOHENDROPUR,SCHOOL',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 10:17:07','2026-10-17 10:17:07'),(19,'CHL-20261017-3882',30,23,'2026-10-17','KU PARA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 11:17:25','2026-10-17 11:17:25'),(20,'CHL-20261017-5521',31,24,'2026-10-17','SORDARPARA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-17 11:22:18','2026-10-17 11:22:18'),(21,'CHL-20261018-6714',33,10,'2026-10-18',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 06:02:32','2026-10-18 06:02:32'),(22,'CHL-20261018-7829',34,25,'2026-10-18','bangla bazar',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 06:22:39','2026-10-18 06:22:39'),(23,'CHL-20261018-9902',35,26,'2026-10-18','noinamoti,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 06:32:56','2026-10-18 06:32:56'),(24,'CHL-20261018-4311',36,19,'2026-10-18','PATKIABARI,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 06:35:40','2026-10-18 06:35:40'),(25,'CHL-20261018-5799',37,27,'2026-10-18','CHADVA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 07:15:47','2026-10-18 07:15:47'),(26,'CHL-20261018-1021',38,28,'2026-10-18','SUJANOGOR',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 07:23:19','2026-10-18 07:23:19'),(27,'CHL-20261018-8986',39,29,'2026-10-18',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 07:42:30','2026-10-18 07:42:30'),(28,'CHL-20261018-3240',41,30,'2026-10-18','chorkurolia,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 08:42:34','2026-10-18 08:42:34'),(29,'CHL-20261018-3828',43,31,'2026-10-18','atgoria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 09:34:16','2026-10-18 09:34:16'),(30,'CHL-20261018-9029',44,32,'2026-10-18','atikula,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 10:07:22','2026-10-18 10:07:22'),(31,'CHL-20261018-9261',45,10,'2026-10-18',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 10:09:47','2026-10-18 10:09:47'),(32,'CHL-20261018-1622',46,31,'2026-10-18','atgoria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 11:48:40','2026-10-18 11:48:40'),(33,'CHL-20261018-5971',47,10,'2026-10-18',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-18 11:51:25','2026-10-18 11:51:25'),(34,'CHL-20261019-1142',48,33,'2026-10-19','dogasi,bazar',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 04:09:34','2026-10-19 04:09:34'),(35,'CHL-20261019-2246',49,34,'2026-10-19',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 04:11:36','2026-10-19 04:11:36'),(36,'CHL-20261019-7015',50,10,'2026-10-19',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 04:13:07','2026-10-19 04:13:07'),(37,'CHL-20261019-4699',51,35,'2026-10-19','Munsurabad',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 04:15:51','2026-10-19 04:15:51'),(38,'CHL-20261019-3829',53,10,'2026-10-19',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 04:21:53','2026-10-19 04:21:53'),(39,'CHL-20261019-9485',55,16,'2026-10-19','DAPUNIA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 05:58:52','2026-10-19 05:58:52'),(40,'CHL-20261019-3238',56,37,'2026-10-19','salgaria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 08:45:50','2026-10-19 08:45:50'),(41,'CHL-20261019-2904',57,38,'2026-10-19','parhousepara,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 08:56:32','2026-10-19 08:56:32'),(42,'CHL-20261019-9731',59,39,'2026-10-19',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 10:23:14','2026-10-19 10:23:14'),(43,'CHL-20261019-3874',61,40,'2026-10-19','GOYESPUR,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 11:11:13','2026-10-19 11:11:13'),(44,'CHL-20261019-8192',62,16,'2026-10-19','DAPUNIA,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 11:21:02','2026-10-19 11:21:02'),(45,'CHL-20261019-3071',63,41,'2026-10-19','Najirpur',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-19 11:23:49','2026-10-19 11:23:49'),(46,'CHL-20261020-6877',64,42,'2026-10-20','Radhanogor,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 02:00:46','2026-10-20 02:00:46'),(47,'CHL-20261020-6532',65,14,'2026-10-20','SALGARIA TALBAGAN',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 02:22:35','2026-10-20 02:22:35'),(48,'CHL-20261020-7765',66,43,'2026-10-20','MERIL BAYPAS',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 02:44:49','2026-10-20 02:44:49'),(49,'CHL-20261020-1810',67,44,'2026-10-20','Masimpur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 03:33:45','2026-10-20 03:33:45'),(50,'CHL-20261020-6769',68,45,'2026-10-20','Poilanpur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 05:13:47','2026-10-20 05:13:47'),(51,'CHL-20261020-5506',69,46,'2026-10-20',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 05:29:34','2026-10-20 05:29:34'),(52,'CHL-20261020-1984',70,47,'2026-10-20','Radhanogor,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 05:39:58','2026-10-20 05:39:58'),(53,'CHL-20261020-9102',71,48,'2026-10-20','POILANPUR,PABNA',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 06:12:32','2026-10-20 06:12:32'),(54,'CHL-20261020-8396',73,50,'2026-10-20','Atikula,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 09:10:36','2026-10-20 09:10:36'),(55,'CHL-20261020-9405',75,51,'2026-10-20','Dasuria,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 09:22:09','2026-10-20 09:22:09'),(56,'CHL-20261020-1654',76,3,'2026-10-20','Autapara,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 09:26:36','2026-10-20 09:26:36'),(57,'CHL-20261020-9599',77,52,'2026-10-20','Salgaria,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 10:49:03','2026-10-20 10:49:03'),(58,'CHL-20261020-5810',79,53,'2026-10-20','Ekdonto bazar',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 10:52:38','2026-10-20 10:52:38'),(59,'CHL-20261020-1892',80,54,'2026-10-20','Dormogram,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 10:56:02','2026-10-20 10:56:02'),(60,'CHL-20261020-2803',81,55,'2026-10-20','chor gorgori',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 11:17:38','2026-10-20 11:17:38'),(61,'CHL-20261020-2948',83,53,'2026-10-20','Ekdonto bazar',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 11:33:27','2026-10-20 11:33:27'),(62,'CHL-20261020-1040',84,57,'2026-10-20','Dapunia Mirjapur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-20 11:51:11','2026-10-20 11:51:11'),(63,'CHL-20261021-8347',74,10,'2026-10-21',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 03:01:18','2026-10-21 03:01:18'),(64,'CHL-20261021-1527',85,59,'2026-10-21','Radhanogor',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 05:04:24','2026-10-21 05:04:24'),(65,'CHL-20261021-1022',86,60,'2026-10-21','Rajapur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 05:07:42','2026-10-21 05:07:42'),(66,'CHL-20261021-3428',87,61,'2026-10-21','Rana park Road',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 05:22:31','2026-10-21 05:22:31'),(67,'CHL-20261021-4014',88,62,'2026-10-21','Krishnopur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 05:26:45','2026-10-21 05:26:45'),(68,'CHL-20261021-2122',89,63,'2026-10-21',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 05:29:20','2026-10-21 05:29:20'),(69,'CHL-20261021-2499',90,63,'2026-10-21',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 05:43:32','2026-10-21 05:43:32'),(70,'CHL-20261021-4025',93,64,'2026-10-21','Kashinathpur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 09:03:14','2026-10-21 09:03:14'),(71,'CHL-20261021-4582',94,65,'2026-10-21','Atgoria,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 09:08:16','2026-10-21 09:08:16'),(72,'CHL-20261021-7807',95,58,'2026-10-21','JALALPUR,PABNA','joyel auto',NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 09:31:42','2026-10-21 09:31:42'),(73,'CHL-20261021-1939',97,10,'2026-10-21',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 10:06:47','2026-10-21 10:06:47'),(74,'CHL-20261021-8998',98,31,'2026-10-21','atgoria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 10:08:29','2026-10-21 10:08:29'),(75,'CHL-20261021-8448',99,66,'2026-10-21',NULL,NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 10:17:30','2026-10-21 10:17:30'),(76,'CHL-20261021-2074',100,67,'2026-10-21','Tebunia,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 10:50:59','2026-10-21 10:50:59'),(77,'CHL-20261021-5284',72,49,'2026-10-21','Auotapara,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-21 10:59:28','2026-10-21 10:59:28'),(78,'CHL-20261022-4231',101,68,'2026-10-22','Gopalpur,Pabna','Sohid Van',NULL,NULL,'DELIVERED',NULL,1,'2026-10-22 02:55:44','2026-10-22 02:55:44'),(79,'CHL-20261022-1647',102,42,'2026-10-22','Radhanogor,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-22 03:03:44','2026-10-22 03:03:44'),(80,'CHL-20261022-3409',103,31,'2026-10-22','atgoria,pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-22 03:42:03','2026-10-22 03:42:03'),(81,'CHL-20261026-7442',104,44,'2026-10-26','Masimpur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-26 01:56:19','2026-10-26 01:56:19'),(82,'CHL-20261026-4158',105,53,'2026-10-26','Ekdonto bazar',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-26 02:13:20','2026-10-26 02:13:20'),(83,'CHL-20261027-1761',112,68,'2026-10-27','Gopalpur,Pabna',NULL,NULL,NULL,'DELIVERED',NULL,1,'2026-10-26 23:39:13','2026-10-26 23:39:13');
/*!40000 ALTER TABLE `challans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_payment_details`
--

DROP TABLE IF EXISTS `customer_payment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_payment_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paid_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `previous_due_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_collection_date` date DEFAULT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_payment_details_customer_id_foreign` (`customer_id`),
  KEY `customer_payment_details_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_payment_details`
--

LOCK TABLES `customer_payment_details` WRITE;
/*!40000 ALTER TABLE `customer_payment_details` DISABLE KEYS */;
INSERT INTO `customer_payment_details` VALUES (1,'1','4.074e-7','0','0.0020000000004074536','2026-10-18','Cash',NULL,'Paid',29,1,'2026-10-18 08:35:56','2026-10-18 08:35:56'),(2,'1','0.7842','0','0.7824000000036904','2026-10-18','Cash',NULL,'Paid',28,1,'2026-10-18 08:36:14','2026-10-18 08:36:14'),(3,'12380.50727599999','0','0','12380.50727599999','2026-10-19','Cash',NULL,'Paid',23,1,'2026-10-19 06:01:17','2026-10-19 06:01:17'),(4,'94520.66','520.66','0','94520.65863199999','2026-10-19','Cash',NULL,'Paid',37,1,'2026-10-19 10:34:34','2026-10-19 10:34:34'),(5,'12380.51','0','0','0','2026-10-19','Cash',NULL,'Paid',23,1,'2026-10-19 11:40:08','2026-10-19 11:40:08'),(6,'2918.5599999999977','0','0','2918.5599999999977','2026-10-19','Cash',NULL,'Paid',26,1,'2026-10-19 11:41:58','2026-10-19 11:41:58'),(7,'1','0','0','0.9900000000016007','2026-10-19','Cash',NULL,'Paid',27,1,'2026-10-19 11:42:43','2026-10-19 11:42:43'),(8,'1','0','0','0.001863999999841326','2026-10-19','Cash',NULL,'Paid',15,1,'2026-10-19 11:42:53','2026-10-19 11:42:53'),(9,'1','0','0','0.003200000000020964','2026-10-19','Cash',NULL,'Paid',10,1,'2026-10-19 11:42:59','2026-10-19 11:42:59'),(10,'1','0','0','0.5','2026-10-19','Cash',NULL,'Paid',32,1,'2026-10-19 11:43:07','2026-10-19 11:43:07'),(11,'3440','0','0','3440','2026-10-20','Cash',NULL,'Paid',42,1,'2026-10-20 04:06:11','2026-10-20 04:06:11'),(12,'1','0','0','0.002803999999741791','2026-10-20','Cash',NULL,'Paid',24,1,'2026-10-20 04:06:54','2026-10-20 04:06:54'),(13,'1','0','0','0.000999999996565748','2026-10-20','Cash',NULL,'Paid',30,1,'2026-10-20 04:07:02','2026-10-20 04:07:02'),(14,'1','0','0','0.004015999962575734','2026-10-20','Cash',NULL,'Paid',31,1,'2026-10-20 04:07:09','2026-10-20 04:07:09'),(15,'1','0','0','0.003300000000081127','2026-10-20','Cash',NULL,'Paid',33,1,'2026-10-20 04:07:16','2026-10-20 04:07:16'),(16,'1','0','0','0.0028000000020256266','2026-10-20','Cash',NULL,'Paid',40,1,'2026-10-20 04:07:23','2026-10-20 04:07:23'),(17,'27983','3','83996.9991','111982.9991','2026-10-20','Cash',NULL,'Partial',16,1,'2026-10-20 05:23:46','2026-10-20 05:23:46'),(18,'14000','0','0','14000','2026-10-20','Cash',NULL,'Paid',46,1,'2026-10-20 07:52:56','2026-10-20 07:52:56'),(19,'31745','4745','0','31745','2026-10-20','Cash',NULL,'Paid',19,1,'2026-10-20 07:54:58','2026-10-20 07:54:58'),(20,'14000','0','0','0','2026-10-20','Cash',NULL,'Paid',46,1,'2026-10-20 07:55:44','2026-10-20 07:55:44'),(21,'900','0','0','900','2026-10-21','Cash',NULL,'Paid',63,1,'2026-10-21 05:29:44','2026-10-21 05:29:44'),(22,'190','0','0','190','2026-10-21','Cash',NULL,'Paid',10,1,'2026-10-21 08:58:48','2026-10-21 08:58:48'),(23,'4','0','40.55','44.55','2026-10-26','Cash','test','Partial',53,1,'2026-10-26 02:50:18','2026-10-26 02:50:18'),(24,'5','0','35.55','40.55','2026-10-26','Cash',NULL,'Partial',53,1,'2026-10-26 02:51:13','2026-10-26 02:51:13'),(25,'5','0','30.549999999999997','35.55','2026-10-26','Cash',NULL,'Partial',53,1,'2026-10-26 03:04:14','2026-10-26 03:04:14'),(27,'5','0','25.55','30.55','2026-10-26','Cash',NULL,'Partial',53,1,'2026-10-26 03:28:55','2026-10-26 03:28:55'),(28,'2','0','23.55','25.55','2026-10-26','Cash',NULL,'Partial',53,1,'2026-10-26 03:29:21','2026-10-26 03:29:21'),(29,'3','0','20.55','23.55','2026-10-26','Cash',NULL,'Partial',53,1,'2026-10-26 03:29:44','2026-10-26 03:29:44'),(30,'5','0','15.55','20.55','2026-10-26','Cash',NULL,'Partial',53,1,'2026-10-26 03:33:03','2026-10-26 03:33:03'),(31,'68','0','31000','31068','2026-10-26','Cash',NULL,'Partial',47,1,'2026-10-26 04:24:15','2026-10-26 04:24:15'),(32,'30','0','69180','69210','2026-10-27','Cash',NULL,'Partial',68,1,'2026-10-27 00:04:39','2026-10-27 00:04:39'),(33,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',137,1,'2026-10-27 23:49:18','2026-10-27 23:49:18'),(34,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',138,1,'2026-10-27 23:50:25','2026-10-27 23:50:25'),(35,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',139,1,'2026-10-27 23:50:46','2026-10-27 23:50:46'),(36,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',147,1,'2026-10-27 23:56:27','2026-10-27 23:56:27'),(37,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',168,1,'2026-10-28 00:09:39','2026-10-28 00:09:39'),(38,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',181,1,'2026-10-28 00:19:45','2026-10-28 00:19:45'),(39,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',186,1,'2026-10-28 00:20:04','2026-10-28 00:20:04'),(40,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',194,1,'2026-10-28 00:21:24','2026-10-28 00:21:24'),(41,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',202,1,'2026-10-28 00:26:59','2026-10-28 00:26:59'),(42,'6000',NULL,NULL,NULL,'2026-10-28','Cash',NULL,'PAID',210,1,'2026-10-28 00:28:50','2026-10-28 00:28:50');
/*!40000 ALTER TABLE `customer_payment_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `previous_due_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district_id` bigint unsigned DEFAULT NULL,
  `upazila_id` bigint unsigned DEFAULT NULL,
  `thana_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `location_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_district_id_foreign` (`district_id`),
  KEY `customers_location_id_foreign` (`location_id`),
  KEY `customers_thana_id_foreign` (`thana_id`),
  KEY `customers_upazila_id_foreign` (`upazila_id`),
  KEY `customers_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (101,'CUST-MADINA-01','Al-Madina Poultry & Layer Farm','Kapasia, Gazipur',NULL,'01712345678',NULL,NULL,NULL,'22450.00',NULL,NULL,NULL,1,'2026-10-28 06:42:45','2026-10-28 06:42:45',NULL),(102,'CUST-BISM-02','Bismillah Agro & Fisheries Project','Gopalpur, Tangail',NULL,'01898765432',NULL,NULL,NULL,'0.00',NULL,NULL,NULL,1,'2026-10-28 06:42:45','2026-10-28 06:42:45',NULL),(103,'CUST-SHAH-03','Shahjalal Broiler Trader & Retail','Uttara Sector-10, Dhaka',NULL,'01934567890',NULL,NULL,NULL,'15000.00',NULL,NULL,NULL,1,'2026-10-28 06:42:45','2026-10-28 06:42:45',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `district_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `districts_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egg_collection_grades`
--

DROP TABLE IF EXISTS `egg_collection_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egg_collection_grades` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `collection_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `grade_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_pieces` int NOT NULL DEFAULT '0',
  `tray_capacity` int NOT NULL DEFAULT '30',
  `trays_equivalent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unit_cost` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `total_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `egg_collection_grades_collection_id_idx` (`collection_id`),
  KEY `egg_collection_grades_product_id_idx` (`product_id`),
  KEY `egg_collection_grades_grade_name_idx` (`grade_name`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egg_collection_grades`
--

LOCK TABLES `egg_collection_grades` WRITE;
/*!40000 ALTER TABLE `egg_collection_grades` DISABLE KEYS */;
INSERT INTO `egg_collection_grades` VALUES (101,101,103,'GRADE_A',3850,30,128.33,9.5000,36575.00,'2026-10-28 06:45:30'),(102,101,104,'GRADE_B',650,30,21.67,8.8000,5720.00,'2026-10-28 06:45:30'),(103,102,103,'GRADE_A',3200,30,106.67,9.5000,30400.00,'2026-10-28 06:45:30'),(104,102,104,'GRADE_B',520,30,17.33,8.8000,4576.00,'2026-10-28 06:45:30');
/*!40000 ALTER TABLE `egg_collection_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egg_collections`
--

DROP TABLE IF EXISTS `egg_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egg_collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `collection_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flock_id` bigint unsigned NOT NULL,
  `collection_date` date NOT NULL DEFAULT (curdate()),
  `total_collected` int NOT NULL DEFAULT '0',
  `rejected_breakage` int NOT NULL DEFAULT '0',
  `accepted_quantity` int NOT NULL DEFAULT '0',
  `allocated_expenses` decimal(15,2) NOT NULL DEFAULT '0.00',
  `cost_per_accepted_egg` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `egg_collections_collection_no_key` (`collection_no`),
  KEY `egg_collections_flock_id_idx` (`flock_id`),
  KEY `egg_collections_collection_date_idx` (`collection_date`),
  KEY `egg_collections_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egg_collections`
--

LOCK TABLES `egg_collections` WRITE;
/*!40000 ALTER TABLE `egg_collections` DISABLE KEYS */;
INSERT INTO `egg_collections` VALUES (101,'COL-20261028-001',101,'2026-10-28',4650,150,4500,42750.00,9.5000,'FINALIZED','Daily morning & evening egg collection from Shed 1',1,'2026-10-28 06:45:30','2026-10-28 06:45:30'),(102,'COL-20261028-002',102,'2026-10-28',3800,80,3720,32736.00,8.8000,'FINALIZED','Daily collection from Shed 2',1,'2026-10-28 06:45:30','2026-10-28 06:45:30');
/*!40000 ALTER TABLE `egg_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egg_regradings`
--

DROP TABLE IF EXISTS `egg_regradings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egg_regradings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `regrade_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_product_id` bigint unsigned NOT NULL,
  `destination_product_id` bigint unsigned NOT NULL,
  `quantity_pieces` int NOT NULL DEFAULT '0',
  `date` date NOT NULL DEFAULT (curdate()),
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `egg_regradings_regrade_no_key` (`regrade_no`),
  KEY `egg_regradings_source_product_id_idx` (`source_product_id`),
  KEY `egg_regradings_destination_product_id_idx` (`destination_product_id`),
  KEY `egg_regradings_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egg_regradings`
--

LOCK TABLES `egg_regradings` WRITE;
/*!40000 ALTER TABLE `egg_regradings` DISABLE KEYS */;
/*!40000 ALTER TABLE `egg_regradings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_types`
--

DROP TABLE IF EXISTS `expense_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expense_types_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_types`
--

LOCK TABLES `expense_types` WRITE;
/*!40000 ALTER TABLE `expense_types` DISABLE KEYS */;
INSERT INTO `expense_types` VALUES (101,'খামার বিদ্যুৎ ও জ্বালানি খরচ (Utilities)','active',1,'2026-10-28 08:14:12','2026-10-28 08:14:12'),(102,'শ্রমিক মজুরি ও বেতন (Labor & Wages)','active',1,'2026-10-28 08:14:12','2026-10-28 08:14:12'),(103,'শেড জীবনিরাপত্তা ও জীবাণুনাশক (Biosecurity)','active',1,'2026-10-28 08:14:12','2026-10-28 08:14:12');
/*!40000 ALTER TABLE `expense_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `expense_type_id` bigint unsigned NOT NULL,
  `staff_id` bigint unsigned DEFAULT NULL,
  `expense_amount` decimal(10,2) NOT NULL,
  `expense_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expenses_expense_type_id_foreign` (`expense_type_id`),
  KEY `expenses_staff_id_foreign` (`staff_id`),
  KEY `expenses_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (101,101,NULL,18500.00,'Monthly electric grid bill and generator diesel fuel for sheds','2026-10-28',1,'2026-10-28 08:14:12','2026-10-28 08:14:12'),(102,102,NULL,25000.00,'Regular weekly wage distribution for shed & pond caretakers','2026-10-28',1,'2026-10-28 08:14:12','2026-10-28 08:14:12');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feed_products`
--

DROP TABLE IF EXISTS `feed_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feed_products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `feed_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bag_weight_kg` decimal(8,2) NOT NULL DEFAULT '50.00',
  `manufacturer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `protein_percent` decimal(5,2) DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feed_products_product_id_key` (`product_id`),
  KEY `feed_products_user_id_idx` (`user_id`),
  KEY `feed_products_target_type_idx` (`target_type`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feed_products`
--

LOCK TABLES `feed_products` WRITE;
/*!40000 ALTER TABLE `feed_products` DISABLE KEYS */;
INSERT INTO `feed_products` VALUES (30,571,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 06:18:20','2026-10-27 06:18:20',NULL,NULL),(32,578,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 06:23:46','2026-10-27 06:23:46',NULL,NULL),(40,602,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 06:24:08','2026-10-27 06:24:08',NULL,NULL),(45,618,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 06:25:58','2026-10-27 06:25:58',NULL,NULL),(46,620,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 23:46:26','2026-10-27 23:46:26',NULL,NULL),(47,624,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 23:49:18','2026-10-27 23:49:18',NULL,NULL),(48,627,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 23:50:25','2026-10-27 23:50:25',NULL,NULL),(49,630,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 23:50:46','2026-10-27 23:50:46',NULL,NULL),(54,647,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 23:56:26','2026-10-27 23:56:26',NULL,NULL),(55,648,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-27 23:56:27','2026-10-27 23:56:27',NULL,NULL),(56,668,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:03:42','2026-10-28 00:03:42',NULL,NULL),(57,671,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:05:06','2026-10-28 00:05:06',NULL,NULL),(58,678,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:05:19','2026-10-28 00:05:19',NULL,NULL),(59,688,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:06:55','2026-10-28 00:06:55',NULL,NULL),(64,706,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:09:38','2026-10-28 00:09:38',NULL,NULL),(65,707,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:09:38','2026-10-28 00:09:38',NULL,NULL),(70,723,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:10:50','2026-10-28 00:10:50',NULL,NULL),(75,733,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:19:45','2026-10-28 00:19:45',NULL,NULL),(76,744,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:20:02','2026-10-28 00:20:02',NULL,NULL),(80,749,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:20:03','2026-10-28 00:20:03',NULL,NULL),(82,763,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:21:23','2026-10-28 00:21:23',NULL,NULL),(86,768,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:21:24','2026-10-28 00:21:24',NULL,NULL),(88,780,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:26:58','2026-10-28 00:26:58',NULL,NULL),(90,785,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:26:58','2026-10-28 00:26:58',NULL,NULL),(94,800,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:28:48','2026-10-28 00:28:48',NULL,NULL),(96,804,'Poultry/Fish Commercial Feed','POULTRY',50.00,NULL,NULL,1,'2026-10-28 00:28:49','2026-10-28 00:28:49',NULL,NULL),(97,101,'Broiler Grower (Pellet)','broiler',50.00,'Kazi Farms Group',19.50,1,'2026-10-28 06:42:45','2026-10-28 06:42:45','KZ-BR-2026-08',NULL),(98,102,'Layer Starter (Mash)','layer',50.00,'CP Bangladesh',18.00,1,'2026-10-28 06:42:45','2026-10-28 06:42:45','CP-LY-2026-12',NULL);
/*!40000 ALTER TABLE `feed_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_accounts`
--

DROP TABLE IF EXISTS `financial_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `financial_accounts_user_id_idx` (`user_id`),
  KEY `financial_accounts_account_type_idx` (`account_type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_accounts`
--

LOCK TABLES `financial_accounts` WRITE;
/*!40000 ALTER TABLE `financial_accounts` DISABLE KEYS */;
INSERT INTO `financial_accounts` VALUES (1,'Main Farm Cash Drawer','CASH',NULL,NULL,NULL,545000.00,'active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38'),(2,'Islami Bank Bangladesh Ltd (A/C: 205011...)','MFS',NULL,NULL,NULL,1250000.00,'active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38'),(3,'bKash Merchant Account (017...)','MFS',NULL,NULL,NULL,85000.00,'active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38'),(4,'ব্যাংক হিসাব (Islami Bank A/C)','BANK',NULL,NULL,NULL,0.00,'active',1,'2026-10-27 04:07:38','2026-10-27 04:07:38');
/*!40000 ALTER TABLE `financial_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_transactions`
--

DROP TABLE IF EXISTS `financial_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `account_id` bigint unsigned NOT NULL,
  `business_unit_id` bigint unsigned DEFAULT NULL,
  `transaction_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `date` date NOT NULL DEFAULT (curdate()),
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `financial_transactions_account_id_idx` (`account_id`),
  KEY `financial_transactions_business_unit_id_idx` (`business_unit_id`),
  KEY `financial_transactions_reference_type_reference_id_idx` (`reference_type`,`reference_id`),
  KEY `financial_transactions_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_transactions`
--

LOCK TABLES `financial_transactions` WRITE;
/*!40000 ALTER TABLE `financial_transactions` DISABLE KEYS */;
INSERT INTO `financial_transactions` VALUES (5,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,1375.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:38:29'),(7,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:39:16'),(8,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,2750.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:39:16'),(10,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:39:47'),(11,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,4125.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:39:48'),(13,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:40:06'),(14,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,5500.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:40:07'),(16,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:41:21'),(17,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,6875.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 04:41:22'),(21,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 05:51:26'),(22,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,8250.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 05:51:26'),(25,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,9450.00,'2026-10-27','Payment for Egg Sale (Cash)',1,'2026-10-27 05:57:20'),(26,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,10650.00,'2026-10-27','Payment for Egg Sale (Cash)',1,'2026-10-27 05:58:05'),(28,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 05:58:22'),(29,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,12025.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 05:58:22'),(33,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:04:21'),(34,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,61000.00,'2026-10-27','Payment for Egg Sale (Cash)',1,'2026-10-27 06:04:21'),(35,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,62375.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:04:22'),(38,1,3,'OUTFLOW',40000.00,'PURCHASE_PAYMENT',NULL,NULL,160000.00,'2026-10-27','Supplier payment for feed purchase (Cash)',1,'2026-10-27 06:18:20'),(39,1,2,'OUTFLOW',2000.00,'EXPENSE',NULL,NULL,158000.00,'2026-10-27','Fish Batch Expense (MEDICINE_AND_LIME): Pond water treatment lime application',1,'2026-10-27 06:18:20'),(40,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,212000.00,'2026-10-27','Payment for Fish Sale (Cash)',1,'2026-10-27 06:18:20'),(42,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,207800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:23:46'),(43,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,209000.00,'2026-10-27','Payment for Egg Sale (Cash)',1,'2026-10-27 06:23:46'),(44,1,3,'OUTFLOW',40000.00,'PURCHASE_PAYMENT',NULL,NULL,172000.00,'2026-10-27','Supplier payment for feed purchase (Cash)',1,'2026-10-27 06:23:46'),(45,1,2,'OUTFLOW',2000.00,'EXPENSE',NULL,NULL,170000.00,'2026-10-27','Fish Batch Expense (MEDICINE_AND_LIME): Pond water treatment lime application',1,'2026-10-27 06:23:46'),(46,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,224000.00,'2026-10-27','Payment for Fish Sale (Cash)',1,'2026-10-27 06:23:46'),(47,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,171375.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:23:46'),(51,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:24:06'),(52,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,172750.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:24:06'),(53,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,173950.00,'2026-10-27','Payment for Egg Sale (Cash)',1,'2026-10-27 06:24:07'),(54,1,3,'OUTFLOW',40000.00,'PURCHASE_PAYMENT',NULL,NULL,160000.00,'2026-10-27','Supplier payment for feed purchase (Cash)',1,'2026-10-27 06:24:08'),(55,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,214000.00,'2026-10-27','Payment for Fish Sale (Cash)',1,'2026-10-27 06:24:08'),(59,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:25:57'),(60,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,215375.00,'2026-10-27','Payment received for Feed Sale (Cash)',1,'2026-10-27 06:25:57'),(61,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,216575.00,'2026-10-27','Payment for Egg Sale (Cash)',1,'2026-10-27 06:25:57'),(62,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,270575.00,'2026-10-27','Payment for Fish Sale (Cash)',1,'2026-10-27 06:25:58'),(68,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793166557992',276575.00,'2026-10-28','Receipt Voucher RV-1793166557992: Partial due collection',1,'2026-10-27 23:49:18'),(69,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,277655.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-27 23:49:19'),(71,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793166625412',283655.00,'2026-10-28','Receipt Voucher RV-1793166625412: Partial due collection',1,'2026-10-27 23:50:25'),(72,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,284735.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-27 23:50:26'),(73,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793166645761',269735.00,'2026-10-28','Payment Voucher PV-1793166645761: Partial settlement for Feed Purchase',1,'2026-10-27 23:50:46'),(74,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793166645939',275735.00,'2026-10-28','Receipt Voucher RV-1793166645939: Partial due collection',1,'2026-10-27 23:50:46'),(75,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,276815.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-27 23:50:46'),(77,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-27 23:56:24'),(78,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,278190.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-27 23:56:24'),(79,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,279390.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-27 23:56:25'),(80,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,333390.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-27 23:56:26'),(81,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793166986711',318390.00,'2026-10-28','Payment Voucher PV-1793166986711: Partial settlement for Feed Purchase',1,'2026-10-27 23:56:27'),(82,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793166986918',324390.00,'2026-10-28','Receipt Voucher RV-1793166986918: Partial due collection',1,'2026-10-27 23:56:27'),(83,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,325470.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-27 23:56:27'),(86,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,326670.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-27 23:59:24'),(87,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,327870.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:01:10'),(88,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,381870.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:03:42'),(89,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,435870.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:05:06'),(90,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,437070.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:05:19'),(91,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,491070.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:05:19'),(92,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,492270.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:06:55'),(93,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,546270.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:06:56'),(94,1,NULL,'RECEIPT',500.00,'MANUAL_ADJUSTMENT',NULL,NULL,545770.00,'2026-10-28',NULL,1,'2026-10-28 00:08:13'),(95,1,NULL,'RECEIPT',500.00,'MANUAL_ADJUSTMENT',NULL,NULL,545270.00,'2026-10-28',NULL,1,'2026-10-28 00:08:33'),(96,1,NULL,'INFLOW',500.00,'CAPITAL',NULL,NULL,545770.00,'2026-10-28',NULL,1,'2026-10-28 00:09:23'),(97,1,NULL,'OUTFLOW',500.00,'DRAWING',NULL,NULL,545270.00,'2026-10-28',NULL,1,'2026-10-28 00:09:23'),(99,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:09:36'),(100,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,546645.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:09:36'),(101,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,547845.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:09:37'),(102,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,601845.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:09:38'),(103,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793167778532',586845.00,'2026-10-28','Payment Voucher PV-1793167778532: Partial settlement for Feed Purchase',1,'2026-10-28 00:09:39'),(104,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793167778698',592845.00,'2026-10-28','Receipt Voucher RV-1793167778698: Partial due collection',1,'2026-10-28 00:09:39'),(105,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,593925.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:09:39'),(106,1,NULL,'INFLOW',500.00,'CAPITAL',NULL,NULL,594425.00,'2026-10-28',NULL,1,'2026-10-28 00:09:40'),(107,1,NULL,'OUTFLOW',500.00,'DRAWING',NULL,NULL,593925.00,'2026-10-28',NULL,1,'2026-10-28 00:09:40'),(111,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:10:30'),(112,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,595300.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:10:31'),(113,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,596500.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:10:50'),(114,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,650500.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:10:50'),(116,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:10:51'),(117,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,651875.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:10:52'),(118,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793168385152',636875.00,'2026-10-28','Payment Voucher PV-1793168385152: Partial settlement for Feed Purchase',1,'2026-10-28 00:19:45'),(119,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793168385311',642875.00,'2026-10-28','Receipt Voucher RV-1793168385311: Partial due collection',1,'2026-10-28 00:19:45'),(120,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,643955.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:19:46'),(121,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,645155.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:20:01'),(122,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,699155.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:20:02'),(124,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:20:03'),(125,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,700530.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:20:03'),(126,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793168403154',685530.00,'2026-10-28','Payment Voucher PV-1793168403154: Partial settlement for Feed Purchase',1,'2026-10-28 00:20:03'),(127,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793168403617',691530.00,'2026-10-28','Receipt Voucher RV-1793168403617: Partial due collection',1,'2026-10-28 00:20:04'),(128,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,692610.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:20:04'),(129,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,693810.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:21:23'),(130,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,747810.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:21:23'),(132,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:21:24'),(133,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,749185.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:21:24'),(134,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793168483914',734185.00,'2026-10-28','Payment Voucher PV-1793168483914: Partial settlement for Feed Purchase',1,'2026-10-28 00:21:24'),(135,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793168484092',740185.00,'2026-10-28','Receipt Voucher RV-1793168484092: Partial due collection',1,'2026-10-28 00:21:24'),(136,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,741265.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:21:25'),(137,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,742465.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:26:57'),(138,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,796465.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:26:58'),(140,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:26:58'),(141,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793168818396',781465.00,'2026-10-28','Payment Voucher PV-1793168818396: Partial settlement for Feed Purchase',1,'2026-10-28 00:26:58'),(142,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,797840.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:26:58'),(143,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793168818619',803840.00,'2026-10-28','Receipt Voucher RV-1793168818619: Partial due collection',1,'2026-10-28 00:26:59'),(144,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,804920.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:26:59'),(145,1,1,'INFLOW',1200.00,'SALE_PAYMENT',NULL,NULL,806120.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:28:48'),(146,1,2,'INFLOW',54000.00,'SALE_PAYMENT',NULL,NULL,860120.00,'2026-10-28','Payment for Fish Sale (Cash)',1,'2026-10-28 00:28:49'),(148,1,3,'INFLOW',7800.00,'SALE_PAYMENT',NULL,NULL,59800.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:28:49'),(149,1,NULL,'OUTFLOW',15000.00,'PURCHASE_PAYMENT',NULL,'PV-1793168929533',845120.00,'2026-10-28','Payment Voucher PV-1793168929533: Partial settlement for Feed Purchase',1,'2026-10-28 00:28:50'),(150,1,NULL,'INFLOW',6000.00,'DUE_COLLECTION',NULL,'RV-1793168930312',851120.00,'2026-10-28','Receipt Voucher RV-1793168930312: Partial due collection',1,'2026-10-28 00:28:50'),(151,1,3,'INFLOW',1375.00,'SALE_PAYMENT',NULL,NULL,852495.00,'2026-10-28','Payment received for Feed Sale (Cash)',1,'2026-10-28 00:28:53'),(152,1,1,'INFLOW',1080.00,'SALE_PAYMENT',NULL,NULL,852200.00,'2026-10-28','Payment for Egg Sale (Cash)',1,'2026-10-28 00:28:53');
/*!40000 ALTER TABLE `financial_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_batches`
--

DROP TABLE IF EXISTS `fish_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_batches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pond_id` bigint unsigned NOT NULL,
  `species_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `stocking_date` date NOT NULL DEFAULT (curdate()),
  `fingerling_count` int NOT NULL DEFAULT '0',
  `fingerling_unit_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fingerling_total_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_mortality_count` int NOT NULL DEFAULT '0',
  `current_fish_count` int NOT NULL DEFAULT '0',
  `latest_avg_weight_g` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estimated_biomass_kg` decimal(15,3) NOT NULL DEFAULT '0.000',
  `accumulated_feed_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `accumulated_other_expenses` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_harvested_count` int NOT NULL DEFAULT '0',
  `total_harvested_kg` decimal(15,3) NOT NULL DEFAULT '0.000',
  `total_harvested_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fish_batches_batch_no_key` (`batch_no`),
  KEY `fish_batches_pond_id_idx` (`pond_id`),
  KEY `fish_batches_species_id_idx` (`species_id`),
  KEY `fish_batches_product_id_idx` (`product_id`),
  KEY `fish_batches_status_idx` (`status`),
  KEY `fish_batches_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_batches`
--

LOCK TABLES `fish_batches` WRITE;
/*!40000 ALTER TABLE `fish_batches` DISABLE KEYS */;
INSERT INTO `fish_batches` VALUES (101,'BATCH-RUI-2026-A',101,101,105,'2026-06-30',8000,6.00,48000.00,150,7350,1350.00,9922.500,125000.00,27000.00,500,650.000,143000.00,'ACTIVE','Semi-intensive commercial Rui batch',1,'2026-10-28 06:45:30','2026-10-28 06:45:30'),(102,'BATCH-TLP-2026-B',102,102,106,'2026-08-29',16000,2.00,32000.00,600,15400,320.00,4928.000,95000.00,18000.00,0,0.000,0.00,'ACTIVE','Monosex Tilapia fast growth batch',1,'2026-10-28 06:45:30','2026-10-28 06:45:30');
/*!40000 ALTER TABLE `fish_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_harvests`
--

DROP TABLE IF EXISTS `fish_harvests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_harvests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `harvest_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `harvest_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PARTIAL',
  `fish_count` int NOT NULL DEFAULT '0',
  `total_weight_kg` decimal(15,3) NOT NULL DEFAULT '0.000',
  `avg_weight_kg` decimal(8,3) NOT NULL DEFAULT '0.000',
  `cost_allocated` decimal(15,2) NOT NULL DEFAULT '0.00',
  `cost_per_kg` decimal(10,2) NOT NULL DEFAULT '0.00',
  `date` date NOT NULL DEFAULT (curdate()),
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fish_harvests_harvest_no_key` (`harvest_no`),
  KEY `fish_harvests_batch_id_idx` (`batch_id`),
  KEY `fish_harvests_product_id_idx` (`product_id`),
  KEY `fish_harvests_date_idx` (`date`),
  KEY `fish_harvests_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_harvests`
--

LOCK TABLES `fish_harvests` WRITE;
/*!40000 ALTER TABLE `fish_harvests` DISABLE KEYS */;
/*!40000 ALTER TABLE `fish_harvests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_mortalities`
--

DROP TABLE IF EXISTS `fish_mortalities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_mortalities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `batch_id` bigint unsigned NOT NULL,
  `mortality_count` int NOT NULL DEFAULT '0',
  `date` date NOT NULL DEFAULT (curdate()),
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fish_mortalities_batch_id_idx` (`batch_id`),
  KEY `fish_mortalities_date_idx` (`date`),
  KEY `fish_mortalities_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_mortalities`
--

LOCK TABLES `fish_mortalities` WRITE;
/*!40000 ALTER TABLE `fish_mortalities` DISABLE KEYS */;
INSERT INTO `fish_mortalities` VALUES (1,1,200,'2026-10-27','Initial transport acclimatization loss',1,'2026-10-27 06:18:20'),(2,3,200,'2026-10-27','Initial transport acclimatization loss',1,'2026-10-27 06:23:46'),(3,5,200,'2026-10-27','Initial transport acclimatization loss',1,'2026-10-27 06:24:08'),(4,7,200,'2026-10-27','Initial transport acclimatization loss',1,'2026-10-27 06:25:58'),(5,13,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-27 23:56:26'),(6,16,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:03:42'),(7,18,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:05:06'),(8,20,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:05:19'),(9,22,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:06:55'),(10,24,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:09:38'),(11,27,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:10:50'),(12,30,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:20:02'),(13,33,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:21:23'),(14,36,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:26:57'),(15,39,200,'2026-10-28','Initial transport acclimatization loss',1,'2026-10-28 00:28:48');
/*!40000 ALTER TABLE `fish_mortalities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_ponds`
--

DROP TABLE IF EXISTS `fish_ponds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_ponds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pond_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pond_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area_decimal` decimal(8,2) NOT NULL DEFAULT '0.00',
  `water_depth_feet` decimal(5,2) NOT NULL DEFAULT '5.00',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fish_ponds_pond_code_key` (`pond_code`),
  KEY `fish_ponds_user_id_idx` (`user_id`),
  KEY `fish_ponds_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_ponds`
--

LOCK TABLES `fish_ponds` WRITE;
/*!40000 ALTER TABLE `fish_ponds` DISABLE KEYS */;
INSERT INTO `fish_ponds` VALUES (101,'POND-A-NORTH','পুকুর ১ (উত্তর বাণিজ্যিক লেক)',180.00,7.50,'North Farm Lake Section','ACTIVE','Deep culture pond for major carps',1,'2026-10-28 06:45:30','2026-10-28 06:45:30'),(102,'POND-B-SOUTH','পুকুর ২ (দক্ষিণ তেলাপিয়া গ্রোথ পুকুর)',120.00,6.00,'South Compound Section','ACTIVE','High-density tilapia culture pond',1,'2026-10-28 06:45:30','2026-10-28 06:45:30');
/*!40000 ALTER TABLE `fish_ponds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_samplings`
--

DROP TABLE IF EXISTS `fish_samplings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_samplings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `batch_id` bigint unsigned NOT NULL,
  `sample_date` date NOT NULL DEFAULT (curdate()),
  `sample_count` int NOT NULL DEFAULT '0',
  `sample_weight_kg` decimal(10,3) NOT NULL DEFAULT '0.000',
  `avg_weight_g` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estimated_biomass_kg` decimal(15,3) NOT NULL DEFAULT '0.000',
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fish_samplings_batch_id_idx` (`batch_id`),
  KEY `fish_samplings_sample_date_idx` (`sample_date`),
  KEY `fish_samplings_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_samplings`
--

LOCK TABLES `fish_samplings` WRITE;
/*!40000 ALTER TABLE `fish_samplings` DISABLE KEYS */;
INSERT INTO `fish_samplings` VALUES (1,1,'2026-10-27',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-27 06:18:20'),(2,3,'2026-10-27',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-27 06:23:46'),(3,5,'2026-10-27',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-27 06:24:08'),(4,7,'2026-10-27',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-27 06:25:58'),(5,13,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-27 23:56:26'),(6,16,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:03:42'),(7,18,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:05:06'),(8,20,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:05:19'),(9,22,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:06:55'),(10,24,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:09:38'),(11,27,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:10:50'),(12,30,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:20:02'),(13,33,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:21:23'),(14,36,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:26:57'),(15,39,'2026-10-28',50,40.000,800.00,3840.000,'Bi-weekly growth monitoring sample',1,'2026-10-28 00:28:48');
/*!40000 ALTER TABLE `fish_samplings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_species`
--

DROP TABLE IF EXISTS `fish_species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_species` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `species_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scientific_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_culture_days` int NOT NULL DEFAULT '180',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fish_species_species_name_key` (`species_name`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_species`
--

LOCK TABLES `fish_species` WRITE;
/*!40000 ALTER TABLE `fish_species` DISABLE KEYS */;
INSERT INTO `fish_species` VALUES (1,'রুই (Rohu)','Labeo rohita',180,'2026-10-27 06:11:32','2026-10-27 06:11:32'),(2,'কাতলা (Catla)','Gibelion catla',210,'2026-10-27 06:11:32','2026-10-27 06:11:32'),(3,'পাঙ্গাশ (Pangas)','Pangasianodon hypophthalmus',150,'2026-10-27 06:11:32','2026-10-27 06:11:32'),(4,'তেলাপিয়া (Tilapia)','Oreochromis niloticus',120,'2026-10-27 06:11:32','2026-10-27 06:11:32'),(5,'Rohu (রুই)','Labeo rohita',240,'2026-10-27 06:18:19','2026-10-27 06:18:19'),(6,'Catla (কাতলা)','Gibelion catla',270,'2026-10-27 06:18:19','2026-10-27 06:18:19'),(101,'Rui (Labeo rohita)','Labeo rohita',240,'2026-10-28 06:45:30','2026-10-28 06:45:30'),(102,'Monosex Tilapia','Oreochromis niloticus',120,'2026-10-28 06:45:30','2026-10-28 06:45:30');
/*!40000 ALTER TABLE `fish_species` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internal_feed_issues`
--

DROP TABLE IF EXISTS `internal_feed_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internal_feed_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `source_business_unit_id` bigint unsigned NOT NULL,
  `destination_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` bigint unsigned DEFAULT NULL,
  `destination_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bags` decimal(10,2) NOT NULL DEFAULT '0.00',
  `bag_weight_kg` decimal(8,2) NOT NULL DEFAULT '50.00',
  `total_kg` decimal(15,3) NOT NULL,
  `unit_cost_per_kg` decimal(15,2) NOT NULL,
  `total_cost` decimal(15,2) NOT NULL,
  `date` date NOT NULL DEFAULT (curdate()),
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `internal_feed_issues_issue_no_key` (`issue_no`),
  KEY `internal_feed_issues_product_id_idx` (`product_id`),
  KEY `internal_feed_issues_source_business_unit_id_idx` (`source_business_unit_id`),
  KEY `internal_feed_issues_destination_type_destination_id_idx` (`destination_type`,`destination_id`),
  KEY `internal_feed_issues_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internal_feed_issues`
--

LOCK TABLES `internal_feed_issues` WRITE;
/*!40000 ALTER TABLE `internal_feed_issues` DISABLE KEYS */;
INSERT INTO `internal_feed_issues` VALUES (101,'ISSUE-202610-001',101,1,'POULTRY_FARM',1,'Shed #1 - Broiler House',10.00,50.00,500.000,65.00,32500.00,'2026-10-28','Routine weekly feeding distribution',1,'2026-10-28 08:09:23'),(102,'ISSUE-202610-002',102,1,'FISH_POND',1,'Pond A - North Commercial Aqua Lake',10.00,50.00,500.000,62.00,31000.00,'2026-10-28','Floating pellet feed allocation for Rui fish',1,'2026-10-28 08:09:23');
/*!40000 ALTER TABLE `internal_feed_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `locations_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balances`
--

DROP TABLE IF EXISTS `opening_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opening_balances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `date` date NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opening_balances_date_user_id_unique` (`date`,`user_id`),
  KEY `opening_balances_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balances`
--

LOCK TABLES `opening_balances` WRITE;
/*!40000 ALTER TABLE `opening_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `selling_price` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_lifecycle_state` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DEDUCTED_AT_INVOICE',
  PRIMARY KEY (`id`),
  KEY `order_details_order_id_foreign` (`order_id`),
  KEY `order_details_product_id_foreign` (`product_id`),
  KEY `order_details_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (101,101,101,'20.00','3450.00','3450.00',1,'2026-10-28 06:55:53','2026-10-28 06:55:53','DEDUCTED_AT_INVOICE'),(102,101,103,'300.00','11.50','11.50',1,'2026-10-28 06:55:53','2026-10-28 06:55:53','DEDUCTED_AT_INVOICE'),(103,102,105,'150.00','280.00','280.00',1,'2026-10-28 06:55:53','2026-10-28 06:55:53','DEDUCTED_AT_INVOICE');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_payment_details`
--

DROP TABLE IF EXISTS `order_payment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_payment_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `transaction_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_collection_date` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_payment_details_order_id_foreign` (`order_id`),
  KEY `order_payment_details_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_payment_details`
--

LOCK TABLES `order_payment_details` WRITE;
/*!40000 ALTER TABLE `order_payment_details` DISABLE KEYS */;
INSERT INTO `order_payment_details` VALUES (116,101,1000.00,NULL,NULL,'Cash','2026-10-22','Partial Paid',1,'2026-10-22 02:55:10','2026-10-22 02:55:10'),(117,102,210.00,NULL,NULL,'Cash','2026-10-22','Partial Paid',1,'2026-10-22 03:03:36','2026-10-22 03:03:36');
/*!40000 ALTER TABLE `order_payment_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_total` decimal(10,2) DEFAULT NULL,
  `return_adjustment_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `delivery_charge` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `due_amount` decimal(10,2) DEFAULT NULL,
  `previous_due_amount` decimal(10,2) DEFAULT NULL,
  `order_note` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `customer_id` bigint unsigned DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `challan_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_REQUIRED',
  PRIMARY KEY (`id`),
  KEY `orders_customer_id_foreign` (`customer_id`),
  KEY `orders_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (101,'ORD-20261028-7101',72450.00,0.00,50000.00,156.00,80.00,22450.00,0.00,'20 bags Broiler feed & 10 trays fresh eggs delivery',101,'2026-10-22',1,'2026-10-22 02:55:10','2026-10-22 02:55:10','DELIVERED'),(102,'ORD-20261028-7202',42000.00,0.00,42000.00,0.00,3.33,0.00,0.00,'150 kg fresh harvested Rui fish dispatch',102,'2026-10-22',1,'2026-10-22 03:03:36','2026-10-22 03:03:36','DELIVERED');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `party_ledger_entries`
--

DROP TABLE IF EXISTS `party_ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `party_ledger_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `party_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `business_unit_id` bigint unsigned DEFAULT NULL,
  `transaction_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `credit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `date` date NOT NULL DEFAULT (curdate()),
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `party_ledger_entries_party_type_customer_id_idx` (`party_type`,`customer_id`),
  KEY `party_ledger_entries_party_type_supplier_id_idx` (`party_type`,`supplier_id`),
  KEY `party_ledger_entries_business_unit_id_idx` (`business_unit_id`),
  KEY `party_ledger_entries_user_id_idx` (`user_id`),
  KEY `party_ledger_entries_customer_id_fkey` (`customer_id`),
  KEY `party_ledger_entries_supplier_id_fkey` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=323 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `party_ledger_entries`
--

LOCK TABLES `party_ledger_entries` WRITE;
/*!40000 ALTER TABLE `party_ledger_entries` DISABLE KEYS */;
INSERT INTO `party_ledger_entries` VALUES (79,'SUPPLIER',NULL,31,3,'INVOICE','PURCHASE',NULL,NULL,40000.00,40000.00,0.00,'2026-10-27','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-27 06:18:20'),(80,'CUSTOMER',111,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-27','Fish Sale: 300 kg @ ৳180',1,'2026-10-27 06:18:20'),(84,'SUPPLIER',NULL,33,3,'INVOICE','PURCHASE',NULL,NULL,40000.00,40000.00,0.00,'2026-10-27','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-27 06:23:46'),(87,'CUSTOMER',114,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-27','Fish Sale: 300 kg @ ৳180',1,'2026-10-27 06:23:46'),(111,'SUPPLIER',NULL,41,3,'INVOICE','PURCHASE',NULL,NULL,40000.00,40000.00,0.00,'2026-10-27','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-27 06:24:08'),(112,'CUSTOMER',126,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-27','Fish Sale: 300 kg @ ৳180',1,'2026-10-27 06:24:08'),(128,'SUPPLIER',NULL,46,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-27','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-27 06:25:58'),(129,'CUSTOMER',134,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-27','Fish Sale: 300 kg @ ৳180',1,'2026-10-27 06:25:58'),(132,'SUPPLIER',NULL,47,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-27 23:46:26'),(134,'CUSTOMER',136,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-27 23:46:26'),(136,'SUPPLIER',NULL,48,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-27 23:49:18'),(138,'CUSTOMER',137,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-27 23:49:18'),(139,'CUSTOMER',137,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793166557992',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793166557992 via Cash',1,'2026-10-27 23:49:18'),(140,'CUSTOMER',137,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-27 23:49:19'),(141,'SUPPLIER',NULL,49,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-27 23:50:25'),(143,'CUSTOMER',138,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-27 23:50:25'),(144,'CUSTOMER',138,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793166625412',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793166625412 via Cash',1,'2026-10-27 23:50:25'),(145,'CUSTOMER',138,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-27 23:50:26'),(146,'SUPPLIER',NULL,50,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-27 23:50:46'),(147,'SUPPLIER',NULL,50,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793166645761',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793166645761 via Cash',1,'2026-10-27 23:50:46'),(148,'CUSTOMER',139,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-27 23:50:46'),(149,'CUSTOMER',139,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793166645939',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793166645939 via Cash',1,'2026-10-27 23:50:46'),(150,'CUSTOMER',139,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-27 23:50:46'),(164,'SUPPLIER',NULL,55,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-27 23:56:26'),(165,'CUSTOMER',146,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-27 23:56:26'),(166,'SUPPLIER',NULL,56,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-27 23:56:27'),(167,'SUPPLIER',NULL,56,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793166986711',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793166986711 via Cash',1,'2026-10-27 23:56:27'),(168,'CUSTOMER',147,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-27 23:56:27'),(169,'CUSTOMER',147,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793166986918',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793166986918 via Cash',1,'2026-10-27 23:56:27'),(170,'CUSTOMER',147,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-27 23:56:27'),(181,'SUPPLIER',NULL,57,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:03:42'),(182,'CUSTOMER',153,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:03:42'),(183,'SUPPLIER',NULL,58,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:05:06'),(184,'CUSTOMER',154,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:05:06'),(186,'SUPPLIER',NULL,59,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:05:19'),(189,'CUSTOMER',156,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:05:19'),(192,'SUPPLIER',NULL,60,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:06:55'),(196,'CUSTOMER',159,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:06:56'),(210,'SUPPLIER',NULL,65,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:09:38'),(211,'CUSTOMER',167,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:09:38'),(212,'SUPPLIER',NULL,66,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-28 00:09:38'),(213,'SUPPLIER',NULL,66,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793167778532',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793167778532 via Cash',1,'2026-10-28 00:09:39'),(214,'CUSTOMER',168,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-28 00:09:39'),(215,'CUSTOMER',168,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793167778698',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793167778698 via Cash',1,'2026-10-28 00:09:39'),(216,'CUSTOMER',168,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-28 00:09:39'),(229,'SUPPLIER',NULL,71,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:10:50'),(230,'CUSTOMER',175,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:10:50'),(243,'SUPPLIER',NULL,76,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-28 00:19:45'),(244,'SUPPLIER',NULL,76,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793168385152',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793168385152 via Cash',1,'2026-10-28 00:19:45'),(245,'CUSTOMER',181,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-28 00:19:45'),(246,'CUSTOMER',181,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793168385311',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793168385311 via Cash',1,'2026-10-28 00:19:45'),(247,'CUSTOMER',181,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-28 00:19:46'),(251,'SUPPLIER',NULL,77,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:20:02'),(253,'CUSTOMER',183,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:20:02'),(259,'SUPPLIER',NULL,80,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-28 00:20:03'),(261,'SUPPLIER',NULL,80,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793168403154',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793168403154 via Cash',1,'2026-10-28 00:20:03'),(264,'CUSTOMER',186,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-28 00:20:03'),(265,'CUSTOMER',186,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793168403617',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793168403617 via Cash',1,'2026-10-28 00:20:04'),(267,'CUSTOMER',186,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-28 00:20:04'),(272,'SUPPLIER',NULL,83,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:21:23'),(273,'CUSTOMER',191,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:21:23'),(278,'SUPPLIER',NULL,86,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-28 00:21:24'),(282,'SUPPLIER',NULL,86,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793168483914',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793168483914 via Cash',1,'2026-10-28 00:21:24'),(285,'CUSTOMER',194,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-28 00:21:24'),(286,'CUSTOMER',194,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793168484092',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793168484092 via Cash',1,'2026-10-28 00:21:24'),(287,'CUSTOMER',194,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-28 00:21:25'),(289,'SUPPLIER',NULL,89,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:26:58'),(293,'CUSTOMER',199,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:26:58'),(296,'SUPPLIER',NULL,91,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-28 00:26:58'),(299,'SUPPLIER',NULL,91,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793168818396',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793168818396 via Cash',1,'2026-10-28 00:26:58'),(302,'CUSTOMER',202,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-28 00:26:59'),(304,'CUSTOMER',202,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793168818619',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793168818619 via Cash',1,'2026-10-28 00:26:59'),(307,'CUSTOMER',202,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-28 00:26:59'),(310,'SUPPLIER',NULL,95,3,'INVOICE','PURCHASE',NULL,NULL,0.00,40000.00,40000.00,'2026-10-28','Feed Purchase: 20 bags @ ৳2000',1,'2026-10-28 00:28:48'),(313,'CUSTOMER',207,NULL,2,'INVOICE','ORDER',NULL,NULL,54000.00,54000.00,0.00,'2026-10-28','Fish Sale: 300 kg @ ৳180',1,'2026-10-28 00:28:49'),(316,'SUPPLIER',NULL,97,3,'INVOICE','PURCHASE',NULL,NULL,0.00,25000.00,25000.00,'2026-10-28','Feed Purchase: 10 bags @ ৳2500',1,'2026-10-28 00:28:49'),(317,'SUPPLIER',NULL,97,NULL,'PAYMENT','PURCHASE_PAYMENT',NULL,'PV-1793168929533',15000.00,0.00,10000.00,'2026-10-28','Payment Voucher PV-1793168929533 via Cash',1,'2026-10-28 00:28:50'),(319,'CUSTOMER',210,NULL,3,'INVOICE','ORDER',NULL,NULL,11200.00,0.00,11200.00,'2026-10-28','Feed Sale: 4 bags @ ৳2800',1,'2026-10-28 00:28:50'),(320,'CUSTOMER',210,NULL,NULL,'PAYMENT','DUE_COLLECTION',NULL,'RV-1793168930312',0.00,6000.00,5200.00,'2026-10-28','Receipt Voucher RV-1793168930312 via Cash',1,'2026-10-28 00:28:50'),(322,'CUSTOMER',210,NULL,1,'INVOICE','ORDER',NULL,NULL,1080.00,1080.00,5200.00,'2026-10-28','Egg Sale: 90 piece (90 pcs)',1,'2026-10-28 00:28:53');
/*!40000 ALTER TABLE `party_ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poultry_flocks`
--

DROP TABLE IF EXISTS `poultry_flocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poultry_flocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `flock_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shed_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `breed` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initial_chicks_count` int NOT NULL DEFAULT '0',
  `current_birds_count` int NOT NULL DEFAULT '0',
  `housing_date` date NOT NULL DEFAULT (curdate()),
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `feed_consumed_kg` decimal(15,3) NOT NULL DEFAULT '0.000',
  `total_expenses` decimal(15,2) NOT NULL DEFAULT '0.00',
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `poultry_flocks_flock_code_key` (`flock_code`),
  KEY `poultry_flocks_user_id_idx` (`user_id`),
  KEY `poultry_flocks_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poultry_flocks`
--

LOCK TABLES `poultry_flocks` WRITE;
/*!40000 ALTER TABLE `poultry_flocks` DISABLE KEYS */;
INSERT INTO `poultry_flocks` VALUES (101,'FLK-HYLINE-01','Shed #1 - Hy-Line Layer Shed','Hy-Line Brown',5000,4920,'2026-08-29','ACTIVE',12500.000,185000.00,'Commercial egg production layer flock 1',1,'2026-10-28 06:45:30','2026-10-28 06:45:30'),(102,'FLK-NOVOGEN-02','Shed #2 - Novogen White Shed','Novogen White',4200,4150,'2026-07-30','ACTIVE',9800.000,142000.00,'Commercial egg production layer flock 2',1,'2026-10-28 06:45:30','2026-10-28 06:45:30');
/*!40000 ALTER TABLE `poultry_flocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_returns`
--

DROP TABLE IF EXISTS `product_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_returns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `date` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_returns_customer_id_foreign` (`customer_id`),
  KEY `product_returns_order_id_foreign` (`order_id`),
  KEY `product_returns_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_returns`
--

LOCK TABLES `product_returns` WRITE;
/*!40000 ALTER TABLE `product_returns` DISABLE KEYS */;
INSERT INTO `product_returns` VALUES (101,'115.00','0.00','0.00',10,'2026-10-28',101,103,101,1,'2026-10-28 08:25:42','2026-10-28 08:25:42'),(102,'1400.00','0.00','0.00',5,'2026-10-28',102,105,102,1,'2026-10-28 08:25:42','2026-10-28 08:25:42');
/*!40000 ALTER TABLE `product_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_price` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sell_price` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_code` json NOT NULL,
  `brand_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `door_side` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tile_size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sqft_per_box` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pcs_per_box` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surface_finish` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_category_id` bigint unsigned DEFAULT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `products_brand_id_foreign` (`brand_id`),
  KEY `products_category_id_foreign` (`category_id`),
  KEY `products_sub_category_id_foreign` (`sub_category_id`),
  KEY `products_unit_id_foreign` (`unit_id`),
  KEY `products_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=817 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (101,NULL,'Kazi Broiler Grower Feed (50kg Bag)','150','3250.00','3450.00','active','[\"FEED-BR-50K\"]',101,101,NULL,NULL,NULL,NULL,NULL,NULL,NULL,101,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(102,NULL,'CP Layer Starter Feed (50kg Bag)','120','3100.00','3300.00','active','[\"FEED-LY-50K\"]',102,101,NULL,NULL,NULL,NULL,NULL,NULL,NULL,101,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(103,NULL,'Brown Table Eggs - Grade A (Large)','2500','9.50','11.50','active','[\"EGG-BR-GRA\"]',103,102,NULL,NULL,NULL,NULL,NULL,NULL,NULL,103,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(104,NULL,'White Table Eggs - Grade B (Medium)','1800','8.80','10.50','active','[\"EGG-WH-GRB\"]',105,102,NULL,NULL,NULL,NULL,NULL,NULL,NULL,103,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(105,NULL,'Live Rui Fish (1.2 Kg - 1.5 Kg Size)','650','220.00','280.00','active','[\"FISH-RUI-15\"]',101,103,NULL,NULL,NULL,NULL,NULL,NULL,NULL,102,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(106,NULL,'Monosex Tilapia Fish (Medium Grade)','800','140.00','190.00','active','[\"FISH-TIL-MD\"]',105,103,NULL,NULL,NULL,NULL,NULL,NULL,NULL,102,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(107,NULL,'Cobb 500 Broiler Day-Old Chicks (DOC)','1000','45.00','55.00','active','[\"DOC-COBB-500\"]',101,104,NULL,NULL,NULL,NULL,NULL,NULL,NULL,103,1,'2026-10-28 00:53:51','2026-10-28 00:53:51'),(108,NULL,'ACI Vitamino Plus (Feed Supplement 1L)','50','480.00','580.00','active','[\"MED-VIT-1L\"]',104,105,NULL,NULL,NULL,NULL,NULL,NULL,NULL,103,1,'2026-10-28 00:53:51','2026-10-28 00:53:51');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_details`
--

DROP TABLE IF EXISTS `purchase_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `purchase_id` bigint unsigned NOT NULL,
  `quantity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_price` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_order_details_product_id_foreign` (`product_id`),
  KEY `purchase_order_details_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_order_details_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_details`
--

LOCK TABLES `purchase_order_details` WRITE;
/*!40000 ALTER TABLE `purchase_order_details` DISABLE KEYS */;
INSERT INTO `purchase_order_details` VALUES (101,101,101,'100.00','3250.00','325000.00',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(102,102,102,'80.00','3100.00','248000.00',1,'2026-10-28 06:42:45','2026-10-28 06:42:45');
/*!40000 ALTER TABLE `purchase_order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_payment_details`
--

DROP TABLE IF EXISTS `purchase_payment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_payment_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchases_id` bigint unsigned NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_due_collection_date` date DEFAULT NULL,
  `purchase_order_details_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_payment_details_purchase_order_details_id_foreign` (`purchase_order_details_id`),
  KEY `purchase_payment_details_purchases_id_foreign` (`purchases_id`),
  KEY `purchase_payment_details_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_payment_details`
--

LOCK TABLES `purchase_payment_details` WRITE;
/*!40000 ALTER TABLE `purchase_payment_details` DISABLE KEYS */;
INSERT INTO `purchase_payment_details` VALUES (101,101,200000.00,NULL,'Bank','Partial','IBBL-TXN-90214','2026-10-28',NULL,1,'2026-10-28 06:43:52','2026-10-28 06:43:52'),(102,102,248000.00,NULL,'Cash','Paid','CASH-REC-0012','2026-10-28',NULL,1,'2026-10-28 06:43:52','2026-10-28 06:43:52');
/*!40000 ALTER TABLE `purchase_payment_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_returns`
--

DROP TABLE IF EXISTS `purchase_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_returns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint unsigned NOT NULL,
  `supplier_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `due_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `quantity` int NOT NULL DEFAULT '0',
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_returns_product_id_foreign` (`product_id`),
  KEY `purchase_returns_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_returns_supplier_id_foreign` (`supplier_id`),
  KEY `purchase_returns_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_returns`
--

LOCK TABLES `purchase_returns` WRITE;
/*!40000 ALTER TABLE `purchase_returns` DISABLE KEYS */;
INSERT INTO `purchase_returns` VALUES (101,101,101,101,1,6500.00,0.00,0.00,2,'2026-10-28','2026-10-28 08:25:42','2026-10-28 08:25:42'),(102,102,102,102,1,3100.00,0.00,0.00,1,'2026-10-28','2026-10-28 08:25:42','2026-10-28 08:25:42');
/*!40000 ALTER TABLE `purchase_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `referance_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_payable_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `grand_subtotal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_charge` decimal(10,2) DEFAULT '0.00',
  `return_adjustment_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `attach_document` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchases_supplier_id_foreign` (`supplier_id`),
  KEY `purchases_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (101,'PUR-20261028-8811','MEMO-KZ-7721','200000.00','125000.00','125000.00','2026-10-28','325000.00',0.00,0.00,NULL,101,1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(102,'PUR-20261028-8822','INV-CP-5541','248000.00','0.00','0.00','2026-10-28','248000.00',0.00,0.00,NULL,102,1,'2026-10-28 06:42:45','2026-10-28 06:42:45');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  KEY `sessions_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `business_unit_id` bigint unsigned DEFAULT NULL,
  `movement_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_after` decimal(15,3) NOT NULL,
  `date` date NOT NULL DEFAULT (curdate()),
  `note` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `stock_movements_product_id_idx` (`product_id`),
  KEY `stock_movements_business_unit_id_idx` (`business_unit_id`),
  KEY `stock_movements_movement_type_idx` (`movement_type`),
  KEY `stock_movements_reference_type_reference_id_idx` (`reference_type`,`reference_id`),
  KEY `stock_movements_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=563 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (555,101,NULL,'PURCHASE_INWARD',100.000,3250.00,325000.00,'PURCHASE',101,NULL,100.000,'2026-10-28','Initial Feed Purchase Kazi Farms',1,'2026-10-28 08:08:38'),(556,102,NULL,'PURCHASE_INWARD',80.000,3100.00,248000.00,'PURCHASE',102,NULL,80.000,'2026-10-28','Initial Feed Purchase CP Bangladesh',1,'2026-10-28 08:08:38'),(557,101,NULL,'INTERNAL_ISSUE',10.000,3250.00,32500.00,'INTERNAL_FEED_ISSUE',101,NULL,90.000,'2026-10-28','Feed issued to Shed #1 Broilers',1,'2026-10-28 08:08:38'),(558,102,NULL,'INTERNAL_ISSUE',10.000,3100.00,31000.00,'INTERNAL_FEED_ISSUE',102,NULL,70.000,'2026-10-28','Feed issued to Pond #1 Fish Batch',1,'2026-10-28 08:08:38'),(559,101,NULL,'PURCHASE_INWARD',100.000,3250.00,325000.00,'PURCHASE',101,NULL,100.000,'2026-10-28','Initial Feed Purchase Kazi Farms',1,'2026-10-28 08:09:23'),(560,102,NULL,'PURCHASE_INWARD',80.000,3100.00,248000.00,'PURCHASE',102,NULL,80.000,'2026-10-28','Initial Feed Purchase CP Bangladesh',1,'2026-10-28 08:09:23'),(561,101,NULL,'INTERNAL_ISSUE',10.000,3250.00,32500.00,'INTERNAL_FEED_ISSUE',101,NULL,90.000,'2026-10-28','Feed issued to Shed #1 Broilers',1,'2026-10-28 08:09:23'),(562,102,NULL,'INTERNAL_ISSUE',10.000,3100.00,31000.00,'INTERNAL_FEED_ISSUE',102,NULL,70.000,'2026-10-28','Feed issued to Pond #1 Fish Batch',1,'2026-10-28 08:09:23');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_categories`
--

DROP TABLE IF EXISTS `sub_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sub_category_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sub_categories_category_id_foreign` (`category_id`),
  KEY `sub_categories_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_categories`
--

LOCK TABLES `sub_categories` WRITE;
/*!40000 ALTER TABLE `sub_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `sub_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_due_collections`
--

DROP TABLE IF EXISTS `supplier_due_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_due_collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `paid_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_payable_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_collection_date` date DEFAULT NULL,
  `supplier_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supplier_due_collections_supplier_id_foreign` (`supplier_id`),
  KEY `supplier_due_collections_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_due_collections`
--

LOCK TABLES `supplier_due_collections` WRITE;
/*!40000 ALTER TABLE `supplier_due_collections` DISABLE KEYS */;
INSERT INTO `supplier_due_collections` VALUES (1,'83','901','0','984','Cash',NULL,'Partial','2026-10-26',1,1,'2026-10-26 03:06:21','2026-10-26 03:06:21'),(2,'1','900','0','901','Cash',NULL,'Partial','2026-10-26',1,1,'2026-10-26 03:06:52','2026-10-26 03:06:52'),(4,'5','895','0','900','Cash',NULL,'Partial','2026-10-26',1,1,'2026-10-26 03:30:07','2026-10-26 03:30:07'),(5,'5','890','0','895','Cash',NULL,'Partial','2026-10-26',1,1,'2026-10-26 03:30:25','2026-10-26 03:30:25'),(6,'10','880','0','890','Cash',NULL,'Partial','2026-10-26',1,1,'2026-10-26 03:30:47','2026-10-26 03:30:47'),(7,'80','800','0','880','Cash',NULL,'Partial','2026-10-27',1,1,'2026-10-27 00:05:09','2026-10-27 00:05:09'),(8,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',50,1,'2026-10-27 23:50:46','2026-10-27 23:50:46'),(9,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',56,1,'2026-10-27 23:56:27','2026-10-27 23:56:27'),(10,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',66,1,'2026-10-28 00:09:39','2026-10-28 00:09:39'),(11,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',76,1,'2026-10-28 00:19:45','2026-10-28 00:19:45'),(12,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',80,1,'2026-10-28 00:20:03','2026-10-28 00:20:03'),(13,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',86,1,'2026-10-28 00:21:24','2026-10-28 00:21:24'),(14,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',91,1,'2026-10-28 00:26:58','2026-10-28 00:26:58'),(15,'15000',NULL,NULL,NULL,'Cash',NULL,NULL,'2026-10-28',97,1,'2026-10-28 00:28:50','2026-10-28 00:28:50');
/*!40000 ALTER TABLE `supplier_due_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `supplier_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_payable_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `suppliers_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (101,'SUP-KAZI-01','Kazi Farms Group Ltd.','Kazi Farms Group','01711234567','Gazipur Feed Plant & Regional Depot',NULL,NULL,'125000.00','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(102,'SUP-CP-02','CP Bangladesh Co. Ltd.','CP Bangladesh','01819876543','Valuka Mymensingh Feed Industrial Area',NULL,NULL,'0.00','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(103,'SUP-NOUR-03','Nourish Poultry & Hatchery Ltd.','Nourish Poultry','01912345678','Mirzapur Tangail Breeding Facility',NULL,NULL,'0.00','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thanas`
--

DROP TABLE IF EXISTS `thanas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thanas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Thana_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_id` bigint unsigned NOT NULL,
  `upazila_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `thanas_district_id_foreign` (`district_id`),
  KEY `thanas_upazila_id_foreign` (`upazila_id`),
  KEY `thanas_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thanas`
--

LOCK TABLES `thanas` WRITE;
/*!40000 ALTER TABLE `thanas` DISABLE KEYS */;
/*!40000 ALTER TABLE `thanas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_conversions`
--

DROP TABLE IF EXISTS `unit_conversions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_conversions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `from_unit_id` bigint unsigned NOT NULL,
  `to_unit_id` bigint unsigned NOT NULL,
  `conversion_rate` decimal(15,4) NOT NULL,
  `operator` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MULTIPLY',
  `business_unit_id` bigint unsigned DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `unit_conversions_from_unit_id_idx` (`from_unit_id`),
  KEY `unit_conversions_to_unit_id_idx` (`to_unit_id`),
  KEY `unit_conversions_business_unit_id_idx` (`business_unit_id`),
  KEY `unit_conversions_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_conversions`
--

LOCK TABLES `unit_conversions` WRITE;
/*!40000 ALTER TABLE `unit_conversions` DISABLE KEYS */;
INSERT INTO `unit_conversions` VALUES (1,6,1,12.0000,'MULTIPLY',NULL,'1 Dozen = 12 Pieces',1,'2026-10-27 04:07:38'),(2,5,1,30.0000,'MULTIPLY',NULL,'1 Standard Tray = 30 Pieces (Configurable)',1,'2026-10-27 04:07:38'),(3,3,7,1000.0000,'MULTIPLY',NULL,'1 Kilogram = 1000 Grams',1,'2026-10-27 04:07:38');
/*!40000 ALTER TABLE `unit_conversions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `units_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES (101,'Bag','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(102,'Kg','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(103,'Piece','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(104,'Dozen','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45'),(105,'Tray','active',1,'2026-10-28 06:42:45','2026-10-28 06:42:45');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `upazilas`
--

DROP TABLE IF EXISTS `upazilas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upazilas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `upazila_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `upazilas_district_id_foreign` (`district_id`),
  KEY `upazilas_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upazilas`
--

LOCK TABLES `upazilas` WRITE;
/*!40000 ALTER TABLE `upazilas` DISABLE KEYS */;
/*!40000 ALTER TABLE `upazilas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'users',
  `permissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'MD arafat Hossain','admin@gmail.com','01711968720','$2b$10$AT3BJn5qDhiTIckEK3pigu6EbSPkgSvH3d1Kt4UyU5mDXQrzT1.nG','000000',NULL,'approved','admin','{\"pos\":true,\"products\":true,\"purchases\":true,\"invoices\":true,\"customers\":true,\"suppliers\":true,\"expenses\":true,\"reports\":true,\"users\":true}','2026-10-11 04:53:37','2026-10-11 04:53:37'),(101,NULL,'Md. Belal Hossain','belal@arafatpoultry.com','01733112233','$2b$10$Oui13Q9GSZ1ogkWdHWZppebWt36CVj4fpwloR3/njETHiizvAB6FW','000000',NULL,'approved','staff',NULL,'2026-10-28 00:37:40','2026-10-28 00:37:40'),(102,NULL,'Abul Kashem','kashem@arafatpoultry.com','01844334455','$2b$10$Oui13Q9GSZ1ogkWdHWZppebWt36CVj4fpwloR3/njETHiizvAB6FW','000000',NULL,'approved','staff',NULL,'2026-10-28 00:37:40','2026-10-28 00:37:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-28 14:26:26
