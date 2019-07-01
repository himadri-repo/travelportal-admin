import { FormGroup, AbstractControl } from '@angular/forms';

// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}

export function ValidateAssignedTo() {
    return (formGroup: FormGroup) => {
        const wslControl = formGroup.controls['assignedto_whl'];
        const taControl = formGroup.controls['assignedto_ta'];
        const rcControl = formGroup.controls['assignedto_rc'];

        let assignedToValue = 0;
        if (wslControl.value) {
            assignedToValue = 2;
        }

        if (taControl.value) {
            assignedToValue += 4;
        }

        if (rcControl.value) {
            assignedToValue += 8;
        }

        if (assignedToValue <= 0) {
            return { invalidAssignedTo: assignedToValue <= 0, errorMessage: 'Assigned to can`t be empty. It should be either Wholesaler/Travel Agent/Retail Customer in combination'};
        } else {
            return null;
        }
    };
}

export function ValidateAccountHead(control: AbstractControl) {
    const acheads = ['markup', 'srvchg', 'cgst', 'sgst', 'igst'];

    const head = acheads.find((val, idx) => {
        return control.value !== null && control.value !== undefined && val.toLowerCase() === control.value.toLowerCase();
    });

    if (head === null || head === undefined) {
        return { invalidAccountHead: true };
    } else {
        return null;
    }
}