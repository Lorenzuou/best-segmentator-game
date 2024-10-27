import cv2 
import numpy as np
import os


# check whick images from folder1 are in fodler2, and return the images that are in both folders
def get_same_images_from_folder(folder_path1, folder_path2):
    same_images = []
    for img_path in os.listdir(folder_path1):
        if img_path in os.listdir(folder_path2):
            same_images.append(cv2.imread(img_path))
    return same_images
# Metrics
def pixel_accuracy(pred, target):
    correct = (pred == target).sum()
    total = pred.size
    return correct / total


def intersection_over_union(pred, target):
    intersection = (pred & target).sum()
    union = (pred | target).sum()
    return intersection / union


def dice_coefficient(pred, target):
    intersection = (pred & target).sum()
    return 2 * intersection / (pred.sum() + target.sum())


def calculate_metrics(pred_list, target_list, metrics):
    total_metrics = {metric: 0 for metric in metrics}
    n = len(pred_list)  # Assuming pred_list and target_list are of the same length

    for pred, target in zip(pred_list, target_list):
        for metric in metrics:
            if metric == 'pixel_accuracy':
                total_metrics[metric] += pixel_accuracy(pred, target)
            elif metric == 'intersection_over_union':
                total_metrics[metric] += intersection_over_union(pred, target)
            elif metric == 'dice_coefficient':
                total_metrics[metric] += dice_coefficient(pred, target)
    # Calculate the mean for each metric
    mean_metrics = {metric: total_metrics[metric] / n for metric in metrics}

    return mean_metrics


def get_segmentation_mask_from_image(img, shape=(1920, 1080)):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    masks = img > 0
    return masks


def get_segmentation_masks_from_images_list(images_list):
    masks = []
    for img in images_list:
        mask = get_segmentation_mask_from_image(img)
        masks.append(mask)
    return masks


def get_segmentation_masks_from_images_folder(folder_path):
    masks = []
    for img_path in os.listdir(folder_path):
        img = cv2.imread(img_path)
        mask = get_segmentation_mask_from_image(img)
        masks.append(mask)
    return masks



# def calculate_metrics_from_images_folder(pred_folder, target_folder, metrics):
#     pred_masks = get_segmentation_masks_from_images_folder(pred_folder)
#     target_masks = get_segmentation_masks_from_images_folder(target_folder)
#     return calculate_metrics(pred_masks, target_masks, metrics)

