import cv2 
import numpy as np
import os


# check whick images from folder1 are in fodler2, and return the images that are in both folders
def get_same_images_from_folder(folder_path1, folder_path2):
    same_images = []
    for img_path in os.listdir(folder_path1):
        same_images.append(cv2.imread(os.path.join(folder_path2, img_path[:-4] + '_segmentation.png')))
    return same_images


def equalize_images_size(images_list1, images_list2):
    equalized_images_list1 = []
    equalized_images_list2 = []
    for img1, img2 in zip(images_list1, images_list2):
        img1 = cv2.resize(img1, (img2.shape[1], img2.shape[0]))
        equalized_images_list1.append(img1)
        equalized_images_list2.append(img2)
    return equalized_images_list1, equalized_images_list2


def get_images_from_folder(folder_path):
    images = []
    with open('metrics.txt', 'a') as f:
        f.write(f'folder_path: {folder_path}\n')
    for img_path in os.listdir(folder_path):
        images.append(cv2.imread(os.path.join(folder_path, img_path)))
    return images

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
    with open('metrics.txt', 'a') as f:
        f.write(f'pred_list: {pred_list}\n')
        f.write(f'target_list: {target_list}\n')
    for pred, target in zip(pred_list, target_list):
        for metric in metrics:
            if metric == 'pixel_accuracy':
                total_metrics[metric] += pixel_accuracy(pred, target)
            elif metric == 'intersection_over_union':
                total_metrics[metric] += intersection_over_union(pred, target)
            elif metric == 'dice_coefficient':
                total_metrics[metric] += dice_coefficient(pred, target)
    with open('metrics.txt', 'a') as f:
        f.write(f'total_metrics: {total_metrics}\n')
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
        img = cv2.imread(os.path.join(folder_path, img_path))
        mask = get_segmentation_mask_from_image(img)
        masks.append(mask)
    return masks



# def calculate_metrics_from_images_folder(pred_folder, target_folder, metrics):
#     pred_masks = get_segmentation_masks_from_images_folder(pred_folder)
#     target_masks = get_segmentation_masks_from_images_folder(target_folder)
#     return calculate_metrics(pred_masks, target_masks, metrics)

